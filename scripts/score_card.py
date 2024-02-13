import os
import re
import sys
import time
import json
import argparse
import logging
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import DirectoryPath
from loading import KnowledgeAssistant as KA
from logging.handlers import RotatingFileHandler

parser = argparse.ArgumentParser(description="Getting input from User to Pass into Retrieval QA")
parser.add_argument("--input", type=str, help="Input from User")
# Parsing the command line arguments
args = parser.parse_args()
data = json.loads(args.input)

base_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(base_directory)

if not os.path.exists(parent_directory+'/logs'):
    try:
        # Create the directory
        os.makedirs(parent_directory+'/logs')
    except OSError as e:
        print(f"Error creating directory '{DirectoryPath}': {e}")

log_file = parent_directory+'/logs/impacts_summary.log'
max_log_size = 1024 * 1024  # 1 MB
backup_count = 3  # Number of backup log files to keep

# Create a logger
logger = logging.getLogger("my_logger")
logger.setLevel(logging.DEBUG)

# Create a RotatingFileHandler to handle log rotation
file_handler = RotatingFileHandler(log_file, maxBytes=max_log_size, backupCount=backup_count)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(file_handler)
#--input '{"file_id":"file-7Wr6NbWidPDpWfKsSOXNW1Qr","talking_points": "The oil and gas industry pays for all necessary costs of plugging abandonment and site restoration of oil and gas wells.The council’s analysis concluded that while the average cost to remediate an onshore well is close to $68,000, the average bond funding available per well is close to $1,000."}'
class Impacts_Summary:

    def __init__(self):
        load_dotenv()
        openai_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=openai_key)

    def deleting_thread(self,thread_ID):
        self.client.beta.threads.delete(thread_id=thread_ID)
        return 
    
    def creating_new_thread(self,file_id):
        thread = self.client.beta.threads.create(
            messages=[
                {
                    "role": "user",
                    "content": "You are a legislative bill analyzer. You extract information based on the user input",
                    "file_ids": [file_id]
                }
            ]
        )
        return thread
    
    def creating_new_thread_html(self):
            thread = self.client.beta.threads.create()
            return thread


    def prompt_template(self,data,talking_points):
        prompt = f"""As a policy analyst, your task is to analyze the bill and determine whether the provided talking points are addressed from any perspective. 
            If the bill discusses these points, your responsibility is to draft a detailed descriptive summary outlining how they are addressed or conveying the bill's stance on them.

            Talking points: {talking_points}

            Note: Your response should be concise, presented in a single paragraph, and directly related to the provided talking points. 
            Avoid adding any unnecessary information.

          """

        return prompt
        
    def query_to_assistant(self,thread,assistant, user_query):
        message = self.client.beta.threads.messages.create(
            thread_id=thread,
            role="user",
            content=user_query
        )

        self.client.beta.threads.messages.list(thread_id=thread).data
        run = self.client.beta.threads.runs.create(
            thread_id=thread,
            assistant_id=assistant
        )

        while True:
            run = self.client.beta.threads.runs.retrieve(thread_id=thread, run_id=run.id)
            if run.status=="completed":
                messages = self.client.beta.threads.messages.list(thread_id=thread)
                latest_message = messages.data[0]
                text = latest_message.content[0].text.value
                break
        return text

    def summary_cleaning(self,text):
        pattern = r'【.*?】'

        # Use re.sub to replace the matched pattern with an empty string
        selected_part = re.sub(pattern, '', text)
        pattern = re.compile(r'Reference:.*', re.DOTALL)
        match = pattern.search(selected_part)

        if match:
            original=len(list(text))
            modified=match.start()

            if (original-modified) > 50:
                return selected_part
            # Remove the matched text
            output_text = text[:match.start()]
            return output_text

        else:
            if selected_part:
                return selected_part
            else:
                # If no match is found, return the original text
                return text


if __name__ == "__main__":
    start=time.time()
    input_assistant_id="asst_A6gy2UGxeUouZ5AIOjYUPjvG"
    
    input_file_id=data["file_id"]
    input_talking_points=data["talking_points"]


    impacts_summary = Impacts_Summary()
    thread_id = impacts_summary.creating_new_thread(input_file_id)
    final_template = impacts_summary.prompt_template(data,input_talking_points)
    result = impacts_summary.query_to_assistant(thread_id.id,input_assistant_id,final_template)
    impacts_summary.deleting_thread(thread_id.id)
    result=impacts_summary.summary_cleaning(result)
    result={
    "result":result
    }
    sys.stdout.write(str(json.dumps(result)))
