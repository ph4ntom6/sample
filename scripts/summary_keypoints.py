import os
import re
import time
import json
import sys
import argparse
import logging
from dotenv import load_dotenv
from openai import OpenAI
from loading import KnowledgeAssistant as KA
from logging.handlers import RotatingFileHandler
from guidance import models, gen, system, user, assistant
parser = argparse.ArgumentParser(description="Getting input from User to Pass into Retrieval QA",)

# --input '{"file_id":"file-ZEoWfatBMKepGX29VhDKyo1c"}'


# file-ZEoWfatBMKepGX29VhDKyo1c
# asst_A6gy2UGxeUouZ5AIOjYUPjvG
# thread_09AFpaeQsEBwLdhIMHm9pIrM
# Add an argument for the directory path
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

log_file = parent_directory+'/logs/summary_keypoints.log'
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

    def deleting_thread(self,thread_ID):
        self.client.beta.threads.delete(thread_id=thread_ID)
        return 
    
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
        return thread.id

    def system_of_assistant(self,thread,assistant, user_query):
        message = self.client.beta.threads.messages.create(
            thread_id=thread,
            role="system",
            content=user_query
        )
        self.client.beta.threads.messages.list(thread_id=thread).data
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

    
    def prompting(self):
        
        final_prompt1=f"""**Input Prompt:**
                            Task: Conduct a Comprehensive Analysis of the Bill.

                            1. **Bill Summary:**
                                - Provide a concise and descriptive summary of the bill.

                            2. **Key General Points of the Bill:**
                                - Present detailed key points encompassing the various aspects of the bill.

                            3. **General Impacts:**
                                - Offer a detailed analysis of the key impact points stemming from this bill.

                            Ensure the response is meticulously structured, with clear demarcation between the summary, key points, and general impacts. If further information or clarification is necessary, kindly articulate it in the response.
                            """
        return final_prompt1
    
     
class guidance_formatiing():

    def __init__(self):
        load_dotenv()
        OPENAI_API_KEY =  os.getenv("OPENAI_API_KEY")
        
        # load a model OpenAI
        self.gpt = models.OpenAI(api_key=OPENAI_API_KEY,model="gpt-3.5-turbo")
    
    def carfting(self,input_data):
        with system():
            lm = self.gpt +  f"""Your Task is to format the user Input data according to the template that is given:
                        Output Template:

                        Output Format:
                        1. **Bill Summary:**
                        - Provide a descriptive summary of the bill.

                        2. **Bill Key Points:**
                        - Provide the key details of the bill.

                        3. **General Impacts:**
                        - Provide detailed information on the general impacts of the bill.

                        """
        with user():
            lm += f"""This is my input that i needed in proper format: {input_data}"""

        with assistant():
            lm += gen("answer")
        return lm
    
    def post_processing(self, lm):
        text =str(lm)

        # Find the index of the phrase "Bill Summary:"
        last_index = text.rfind("Bill Summary:")

        # Check if the phrase was found
        if last_index != -1:
            # Extract the text after the last "Bill Summary:"
            bill_summary_content = text[last_index:].strip()
            # print('BEFORE',bill_summary_content)      
        return bill_summary_content
    
    def post_dict(self,text):
        #Define keywords
        keywords = [
            "Bill Summary",
            "Bill Key Points",
            'General Impacts']
        # Initialize the dictionary
        text = text.replace('**', '')
        text=text.replace(':','')
        text=text.replace('Evaluation of Impact on Company Policies:','')
        sections = {}
        # Iterate through keywords and extract corresponding sections
        for i in range(len(keywords)-1):
            start_index = text.find(keywords[i])
            end_index = text.find(keywords[i + 1])
            # If the keyword is found, add it to the dictionary
            if start_index != -1 and end_index != 1:
                section_content = text[start_index + len(keywords[i]):end_index].strip()
                sections[keywords[i]] = section_content
            else:
                # If the keyword is not found, set an empty string as the value
                sections[keywords[i]] = ""
        last_keyword = keywords[-1]
        last_index = text.find(last_keyword)
        next_double_newline = text.find("\n\n", last_index + len(last_keyword))

        if next_double_newline != -1:
            sections[last_keyword] = text[last_index + len(last_keyword):next_double_newline].strip()
        else:
            sections[last_keyword] = text[last_index + len(last_keyword):].strip()
        return sections

    def mapping(self,original_dict):
        key_mapping = {"Bill Summary":'summary',"Bill Key Points": 'key_points','General Impacts':'impacts'}
        new_dict = {key_mapping.get(old_key, old_key): value for old_key, value in original_dict.items()}
        return new_dict

    def chunks(self,dictt):
        corpus=dictt["impacts"]
        corpus1=dictt["key_points"]
        # Split the corpus into chunks based on "\n"
        chunks = corpus.split('\n')
        impact_list = [chunk.strip() for chunk in chunks if chunk.strip()]

        # Split the corpus into chunks based on "\n"
        chunks1 = corpus1.split('\n')
        key_points_list = [chunk.strip() for chunk in chunks1 if chunk.strip()]
        return impact_list,key_points_list

    def mapped_value(self,dictt,impacts,keypoints):
        dictt["impacts"]=impacts
        dictt["key_points"]=keypoints
        dictt["summary"]=[dictt["summary"]]
        return dictt
    def cleaning(self, text):
        # Define a regular expression pattern to match the first pattern
        pattern = r'【(.*?)】'
        # Use re.sub to replace the matched pattern with an empty string
        cleaned_text = re.sub(pattern, '', text)
        pattern1 = re.compile(r'\b\d+\.\s*|\s*-\s*')
        # Use the sub function to replace matches with an empty string
        cleaned_text = re.sub(pattern1, '', cleaned_text)
        cleaned_text = cleaned_text.replace('<|im_end|>', '')
        cleaned_text = cleaned_text.replace('<|im_end|', '')

        return cleaned_text

    def postprocess_dict(self, input_dict):
        # Iterate through the keys in the dictionary
        for key in input_dict:
            # Apply the cleaning function to the corresponding value
            input_dict[key] = [self.cleaning(text) for text in input_dict[key]]
            filtered_corpus = [sentence for sentence in input_dict[key] if len(sentence.split()) >= 5]
            input_dict[key] = filtered_corpus

        return input_dict
if __name__ == "__main__":
    start=time.time()
    input_file_path=data["file_id"]
    input_assistant_id="asst_A6gy2UGxeUouZ5AIOjYUPjvG"
    input_assistant_id_code="asst_xbrR4fukDzUFhd9l0bkQ3ZX8"

    
    code_interpreter="False"
    check =True
    i=1
    while check:
        check=False
        knowledge_assistant = KnowledgeAssistant()
        user_input=knowledge_assistant.prompting()
        thread_id = knowledge_assistant.creating_new_thread(input_file_path)
        
        result = knowledge_assistant.query_to_assistant(thread_id, input_assistant_id, user_input)
        knowledge_assistant.deleting_thread(thread_id)
        time_taken_retrieval=time.time()
        retrive= time_taken_retrieval-start
        logger.debug("Result Retrieval : %s", result)
        logger.debug("Result Retrieval Time: %s", retrive)


        # phrases_to_check = ["There is an issue with accessing the file.","The file needs to be reuploaded.","The analysis cannot proceed without the file.","The analysis is currently on hold due to the file access issue.Reuploading the file will allow the analysis to continue.","re-upload the file","the uploaded file cannot be accessed.","document is still inaccessible","access the document","there's is an issue ","issue in accessing the document","access the document.","technical issue", "unable to access", "Could you please upload the file?", "currently unable to retrieve the bill.","technical difficulty","technical difficulties"]

        # if any(re.search(re.escape(phrase), result.lower()) for phrase in phrases_to_check):
        #     Loading_instance=KA()
        #     if data["assistant_id_code"]=="None":

        #         data["assistant_id_code"]=Loading_instance.code_interpret_rescue(data['file_path'])

        #     code_interpreter="True"
        #     # thread_id = knowledge_assist.creating_new_thread()
        #     # data['thread_id']=thread_id.id

        #     thread_id = knowledge_assistant.creating_new_thread()
        #     result = knowledge_assistant.query_to_assistant(thread_id, data["assistant_id_code"], user_input)
        #     time_taken_code_interpreter=time.time()
        #     code_interpret=time_taken_code_interpreter-start
        #     logger.debug("Result code_Interpreter : %s", result)
        #     logger.debug("Result code_Interpreter Time: %s", code_interpret)

        guide=guidance_formatiing()
        result_guide=guide.carfting(result)
        result_guide=guide.post_processing(result_guide)
        result_dict=guide.post_dict(result_guide)
        mapped_dict=guide.mapping(result_dict)
        impact_list,key_point_list= guide.chunks(mapped_dict)
        final=guide.mapped_value(mapped_dict,impact_list,key_point_list)

        i+=1
        for key, value in final.items():
            if (value == [] or (isinstance(value, str) and not value.strip())) and i<3:  
                check =True
    cleaned_dict = guide.postprocess_dict(final)
    summary_string = "\n".join(cleaned_dict["summary"])
    cleaned_dict["summary"] = summary_string
    logger.debug("Final Result  : %s", cleaned_dict)
    result={
        "result":cleaned_dict
        }
    sys.stdout.write(str(json.dumps(result)))

    # --input '{"assistant_id":"asst_ghjRIrDpihOuOI6RddioU7CD"}'