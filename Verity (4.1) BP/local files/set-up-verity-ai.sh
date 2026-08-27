
pkg update -y
pkg install git cmake clang curl -y
git clone --depth 1 https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release -j4
mkdir -p models && cd models
curl -L -o model.gguf "https://huggingface.co/QuantFactory/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct.Q4_K_M.gguf"
cd ..
echo "Starting server..."
./build/bin/llama-server -m models/model.gguf --host 0.0.0.0 --port 11434 -c 2048
