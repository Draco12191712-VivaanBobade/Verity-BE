"""Project a Bedrock poly_mesh onto an exact sphere and use smooth normals.


Example (run from the add-on's root folder):
    python "Verity (1.1.0) BP/scripts/verity/spherize_verity_geo.py"
"""

import argparse
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_INPUT = ROOT / "Verity (1.1.0) RP/models/entity/verity_old.geo.json"
DEFAULT_OUTPUT = ROOT / "Verity (1.1.0) RP/models/entity/verity.geo.json"


def midpoint(minimum, maximum):
    return [(minimum[axis] + maximum[axis]) / 2 for axis in range(3)]


def mesh_center(positions):
    minimum = [min(position[axis] for position in positions) for axis in range(3)]
    maximum = [max(position[axis] for position in positions) for axis in range(3)]
    return midpoint(minimum, maximum)


def mean_radius(positions, center):
    radii = [
        math.sqrt(sum((position[axis] - center[axis]) ** 2 for axis in range(3)))
        for position in positions
    ]
    return sum(radii) / len(radii)


def normalized(vector):
    length = math.sqrt(sum(value * value for value in vector))
    if length < 1e-10:
        raise ValueError("A vertex is located at the sphere center")
    return [value / length for value in vector]


def rounded(vector):
    return [round(value, 6) for value in vector]


def spherize_mesh(mesh):
    positions = mesh["positions"]
    center = mesh_center(positions)
    radius = mean_radius(positions, center)
    spherical_positions = []
    normals = []

    for position in positions:
        normal = normalized(
            [position[axis] - center[axis] for axis in range(3)]
        )
        normals.append(rounded(normal))
        spherical_positions.append(
            rounded(
                [
                    center[axis] + normal[axis] * radius
                    for axis in range(3)
                ]
            )
        )

    mesh["positions"] = spherical_positions
    mesh["normals"] = normals

    # A smooth normal is stored for every position, so each polygon corner's
    # normal index must match its position index.
    for polygon in mesh["polys"]:
        vertices = next(iter(polygon.values())) if isinstance(polygon, dict) else polygon
        for vertex in vertices:
            vertex[1] = vertex[0]

    return center, radius


def main():
    parser = argparse.ArgumentParser(
        description="Make Verity's Bedrock poly_mesh exactly spherical."
    )
    parser.add_argument("--in", dest="source", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--out", dest="output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    document = json.loads(args.source.read_text(encoding="utf-8"))
    mesh_count = 0

    for geometry in document.get("minecraft:geometry", []):
        for bone in geometry.get("bones", []):
            mesh = bone.get("poly_mesh")
            if not mesh:
                continue
            center, radius = spherize_mesh(mesh)
            mesh_count += 1
            print(
                f"Spherized {bone.get('name', '<unnamed>')}: "
                f"center={rounded(center)}, radius={round(radius, 6)}"
            )

    if mesh_count == 0:
        raise ValueError("No poly_mesh was found in the input geometry")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(document, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
