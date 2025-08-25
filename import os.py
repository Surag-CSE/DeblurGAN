import os
import shutil

def copy_folder_structure(source, destination):
    for root, dirs, files in os.walk(source):
        # Get the relative path from the source
        rel_path = os.path.relpath(root, source)
        target_path = os.path.join(destination, rel_path)
        
        # Create the directory in the destination
        os.makedirs(target_path, exist_ok=True)
        
        print(f"Created: {target_path}")

# Set your source and destination folder paths
source_folder = "path/to/folder1"  # Change this to your actual folder1 path
destination_folder = "path/to/folder2"  # Change this to your actual folder2 path

copy_folder_structure(source_folder, destination_folder)
