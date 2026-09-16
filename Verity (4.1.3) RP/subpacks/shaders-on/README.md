# Somber — Bedrock Port

A best effort Minecraft: Bedrock Edition port of [Somber](https://modrinth.com/shader/somber) by **Snorfield**.

Somber is a Java Edition/Iris shader licensed under the MIT License. This project is a **Bedrock resource pack**, not a direct GLSL shader port, becuase Bedrock Edition does not provide the same open fragment-shader pipeline available through Iris/OptiFine.

**Resource Packs**

For the Vibrant Visuals color-grading features to apply, **Vibrant Visuals must be enabled** in the world's video settings.

## Features

The Bedrock port currently aims to reproduce the following Somber features:

- Depth based atmospheric fog
- Dense, desaturated grey-green fog
- Darker cave atmosphere
- Opaque water
- Increased blue coloration in water
- Increased foliage green
- Harsh, high contrast lighting
- Muted color grading
- Stronger shadow contrast
- Somber style overall atmosphere

## Not Included

Some effects from the original Somber shader cannot currently be reproduced through Bedrock's public resource-pack and Vibrant Visuals systems.

The following original features are therefore not included:

- Chromatic aberration
- Vignette
- Animated film grain/noise
- Original per-pixel `lightmap^4` lighting curve
- Custom sun brightness
- Custom moon brightness
- Custom star brightness
- Iris shader-option sliders

These effects require rendering capabilities that are available to Java Edition shader loaders such as Iris but are not exposed to Bedrock resource-pack creators.

## Compatibility

This project is intended for Minecraft: Bedrock Edition versions supporting the Vibrant Visuals features used by the pack.

Vibrant Visuals is required for the color-grading portion of the pack. Other resource-pack features may function without Vibrant Visuals, depending on the Minecraft version.

Because Minecraft Bedrock's rendering system is constantly changing, compatibility may change between game versions.

## Project Status

**Work in progress.**

This is a best-effort recreation of Somber's visual style within the limitations of Minecraft: Bedrock Edition.

The goal is to reproduce the recognizable atmosphere and major visual characteristics of Somber as closely as the supported Bedrock rendering systems allow.

It is not intended to be a perfect recreation of the original Java/Iris shader.

## Attribution

This project is based on and inspired by **Somber Shaders** by **Snorfield**.

Original project:

**Somber Shaders**  
Copyright © 2025 Snorfield  
Licensed under the MIT License.

The original Somber pack icon is also used by this project.

The original Somber MIT License is included in:

`LICENSE-SOMBER`

## Licensing

### This Project

Original work created specifically for this Bedrock port is licensed under the MIT License unless otherwise stated.

See:

`LICENSE`

### Somber Shaders

Original Somber material remains licensed under its original MIT License.

See:

`LICENSE-SOMBER`

The original copyright notice and permission notice are preserved in accordance with the MIT License.

## Disclaimer

This is an unofficial community project.

It is not affiliated with, endorsed by, or sponsored by **Snorfield**, **Mojang Studios**, or **Microsoft**.

**Minecraft** is a trademark of Microsoft Corporation.

## Credits

**Original Somber Shaders:**  
Snorfield

**Bedrock port:**  
Draco12191712 (Vivaan Bobade)
