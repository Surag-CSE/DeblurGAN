import os
import subprocess
import torch
from flask import Flask, render_template, request, send_from_directory, redirect, url_for
from PIL import Image
from pyngrok import ngrok

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Fix CUDA Out of Memory issue
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

app = Flask(__name__, static_folder='.', template_folder='.')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return redirect(url_for('index'))

    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('index'))

    if file:
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], 'input.png')
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], 'output.png')
        file.save(input_path)

        try:
            torch.cuda.empty_cache()
            command = [
                "python", "NAFNet/demo.py",
                "-opt", "NAFNet/options/test/REDS/NAFNet-width64.yml",
                "--input_path", input_path,
                "--output_path", output_path
            ]

            result = subprocess.run(command, text=True)

            if result.returncode != 0:
                return f"Error: {result.stderr}"

            return url_for('get_output', filename='output.png')

        except Exception as e:
            return f"Exception: {str(e)}"

@app.route('/outputs/<filename>')
def get_output(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = 7860
    try:
        ngrok.set_auth_token("2tVv6FH3aDOc62QtQ3YuPSPh4IL_3mnQjE1ypjV9LVw9TysUn")
        public_url = ngrok.connect(port, headers={"ngrok-skip-browser-warning": "true"}).public_url
        print(f"Public URL: {public_url}")
        app.run(debug=True, host='0.0.0.0', port=port)
    except Exception as e:
        print(f"Failed to establish public URL via ngrok: {e}")
        app.run(debug=True, host='0.0.0.0', port=port)






#2tV34VFYUTWecpLjMC1PJ9BSafD_2zzxpJYoyTmXkki8od5HY