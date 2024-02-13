from dotenv import load_dotenv
from openai import OpenAI
import os
import time
import sys
import json
import argparse

#   --input '{"file_path":"/Users/kashmalajamshaid/Downloads/20230AB1_93.pdf"}'

class KnowledgeAssistant:

    def __init__(self):
        load_dotenv()
        openai_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=openai_key)

    def upload_Document(self, file_path):
        file_name = os.path.basename(file_path)
        # print("base Name", file_name)
        client_details = self.client.files.list()
        # print('list of files', client_details)
        # Assuming the data is directly in client_details
        file_objects = client_details.data

        # Find the file with the matching filename
        uploaded_file = next((entry for entry in file_objects if entry.filename == file_name), None)
        # print(uploaded_file)
        # Check if a matching file is found
        if uploaded_file is None:
            uploaded_file = self.client.files.create(
                file=open(file_path, 'rb'),
                purpose='assistants',
                )
           
            return uploaded_file.id
        else:
            return uploaded_file.id
        
    

def main():
    
    parser = argparse.ArgumentParser(description="Getting input from User to Pass into Retrieval QA")
    parser.add_argument("--input", type=str, help="Input from User")
    args = parser.parse_args()
    data = json.loads(args.input)
    input_file_path=data["file_path"]

    ka = KnowledgeAssistant()
    uploaded = ka.upload_Document(input_file_path)

    
    output = {
    "file_id": uploaded
    }
    sys.stdout.write(str(json.dumps(output)))

if __name__ == "__main__":
    main()