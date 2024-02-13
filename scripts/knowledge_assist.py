import os
import json
import sys
import argparse
import re
import time
import logging
from dotenv import load_dotenv
from openai import OpenAI
from logging.handlers import RotatingFileHandler
from loading import KnowledgeAssistant as KA

parser = argparse.ArgumentParser(description="Getting input from User to Pass into Retrieval QA")
# --input '{"thread_id":"None","user_input":"what are the key points of the bill", "file_id":"file-1si1SAKSaI8EFJBPwvb0E4PO"}'
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
        print(f"Error creating directory '{directory_path}': {e}")


log_file = parent_directory+'/logs/knowledge_assist.log'
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



class KnowledgeAssistant:

    def __init__(self):
        load_dotenv()
        openai_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=openai_key)
        
    def prompting(self, question,new_thread):
        prompt=''
        if new_thread==True:
            prompt=f"""(role : system, content: You are  a conversational ,intelligent and confident AI assistant Bot who is expert 
                        in finding information from the bill provided. , capable of providing accurate and 
                        thorough responses. When responding to user questions, assume a confident tone and ensure
                        your answers are well-informed.
                        Document Information: The Document is divided into Sections followed by a One digit or two digits.
                        Like Section 1 , SEC 2, SEC 3 and so on only first section is written as Section followed by a digit and 
                        rest are as SEC followed by digit. 
                        When looking for information do the following steps:
                        - Look for word SECTION or SEC followed by number upto two integer. ignore those having higher number.
                        - User will refer it as a section you have to figure on your own based on Document information to find Section or SEC in the bill
                        - If a user question is general try to answer it from your knowledge.
                        
                        Make sure your answers are informative)"""
                        
        
        prompt+=f"""(role: user, content :Your domain is a Legislative Bill Analyzer .Think step by step : 
                    -First analyze the question from user and than proceed
                    

                    User Question: {question})"""

        return prompt

    def creating_new_thread(self,file_id):
        thread = self.client.beta.threads.create(
        messages=[
            {
            "role": "user",
            "content": "You are a legislative Bill analyzer You extract information based on the user Input",
            "file_ids": [file_id]
            }
        ]
        )
        return thread
    

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
            if run.status == "completed":
                messages = self.client.beta.threads.messages.list(thread_id=thread)
                message = messages.data[0]
                text = message.content[0].text.value

                # # Extract the message content
                # message_content = message.content[0].text
                # annotations = message_content.annotations
                # citations = []

                # # Iterate over the annotations and add footnotes
                # for index, annotation in enumerate(annotations):
                #     # Replace the text with a footnote
                #     message_content.value = message_content.value.replace(annotation.text, f' [{index}]')

                #     # Gather citations based on annotation attributes
                #     if (file_citation := getattr(annotation, 'file_citation', None)):
                #         cited_file = self.client.files.retrieve(file_citation.file_id)
                #         citations.append(f'[{index}] {file_citation.quote} from {cited_file.filename}')
                #     elif (file_path := getattr(annotation, 'file_path', None)):
                #         cited_file = self.client.files.retrieve(file_path.file_id)
                #         citations.append(f'[{index}] Click <here> to download {cited_file.filename}')
                #         # Note: File download functionality not implemented above for brevity

                # # Add footnotes to the end of the message before displaying to the user
                # message_content.value += '\n' + '\n'.join(citations)
                # try:
                #     quote = message_content.annotations[0].file_citation.quote
                # except:
                #     quote=""
                break
        # Move the return statement outside the while loop
        return text
    def cleaning(self, text):
        # Define a regular expression pattern to match the first pattern
        pattern = r'【(.*?)】'
    # Use re.sub to replace the matched pattern with an empty string
        cleaned_text = re.sub(pattern, '', text)
        return cleaned_text


if __name__ == "__main__":
    start=time.time()

    input_thread_id=data["thread_id"]
    input_assistant_id="asst_A6gy2UGxeUouZ5AIOjYUPjvG"
    input_assistant_id_code="asst_xbrR4fukDzUFhd9l0bkQ3ZX8"
    input_user_input=data["user_input"]
    input_file_id=data["file_id"]

    knowledge_assist = KnowledgeAssistant()
    code_interpreter="False"
    new_thread=False
    if input_thread_id == "None":
        new_thread=True
        thread_id = knowledge_assist.creating_new_thread(input_file_id)
        input_thread_id = thread_id.id

    question=knowledge_assist.prompting(data['user_input'],new_thread)
    result = knowledge_assist.query_to_assistant(input_thread_id, input_assistant_id,question)

    time_taken_retrieval=time.time()
    retrive= time_taken_retrieval-start
    logger.debug("Result Retrieval : %s", result)
    logger.debug("Result Retrieval Time: %s", retrive)


    # phrases_to_check = ["re-upload the file","the uploaded file cannot be accessed.","document is still inaccessible","access the document","there's is an issue ","issue in accessing the document","access the document.","technical issue", "unable to access", "Could you please upload the file?", "currently unable to retrieve the bill.","unable to extract","technical difficulty","technical difficulties","technical constraints"]
    # if any(re.search(re.escape(phrase), result.lower()) for phrase in phrases_to_check):
    #     Loading_instance=KA()
    #     if data["assistant_id_code"]=="None":
    
    #         data["assistant_id_code"]=Loading_instance.code_interpret_rescue(data['file_path'])

    #     code_interpreter="True"
    #     # thread_id = knowledge_assist.creating_new_thread()
    #     # data['thread_id']=thread_id.id
    #     thread_id = knowledge_assist.creating_new_thread()
    #     question=knowledge_assist.prompting(data['user_input'],new_thread=True)
    #     result, citation = knowledge_assist.query_to_assistant(thread_id, data["assistant_id_code"],question)

    #     time_taken_code_interpreter=time.time()
    #     code_interpret=time_taken_code_interpreter-start
    #     logger.debug("Result code_Interpreter : %s", result)
    #     logger.debug("Result code_Interpreter Time: %s", code_interpret)

    result=knowledge_assist.cleaning(result)
    logger.debug("Final Result  : %s", result)
    
    output = {
    "thread_id": input_thread_id,
    "result": result
    }
    sys.stdout.write(str(json.dumps(output)))