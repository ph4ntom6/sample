import time
import re
import json
import sys
import os
import argparse
import logging
from dotenv import load_dotenv
from openai import OpenAI
from loading import KnowledgeAssistant as KA
from logging.handlers import RotatingFileHandler
from guidance import models, gen, system, user, assistant
parser = argparse.ArgumentParser(description="Getting input from User to Pass into Retrieval QA")

#--input '{"file_id":"file-7Wr6NbWidPDpWfKsSOXNW1Qr","client":"ARMCO","policies": ["If Oil and gas wells are idle then the company should be responsible for restoration of place.","State will be liable for costs of plugging and abandonment wells.","Wells will be transferred to another one where they can settle all their costs of plugging. And can also use the previous owner's indemnity bond.","A person who acquires the right to operate a well or production facility, whether by purchase, transfer, assignment, conveyance, or exchange must notify the supervisor or the district deputy for new person operation starting. And acquisition is not complete till the deputy receives complete details of new operators and their operations.","The drilling, redrilling, deepening, or in any operation permanently altering the casing of a well, shall file the indemnity bond for each well in these ranges.","Twenty thousand dollars $20,000 for each well that is less than 10,000 feet deep. Fifty thousand dollars $50,000 for each well that is 10,000 or more feet deep."]}'

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

log_file = parent_directory+'/logs/client_impacts.log'
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
        return thread
    
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
    def convert_to_policy_format(self,text):
        lines = text.split('\n')
        policy_number = 1
        converted=""
        for line in lines:
            line = line.strip()
            if line:
                converted+=f"        {chr(ord('a') + policy_number - 1)}. Policy {policy_number}: {line} \n"
                policy_number += 1
        return converted
    
    def prompting(self,policies):
        policies_modified=self.convert_to_policy_format(policies)
        final_prompt = """**Task:** Analyze a bill to assess its impact on company policies, emphasizing a detailed descriptive analysis of both positive and negative effects.

                        **Company Policies:**
                        {policies_modified}  # Replace with relevant company policies

                        **Evaluation of Impact on Company Policies:**

                        **Positive Impacts:**
                            - Thoroughly analyze the company policy with respect to the bill to evaluate how it is positively affected by the bill.
                            - Provide a comprehensive descriptive analysis of positively affected points, including reference sections if applicable.
                            - Address subcategories of positive impacts separately if necessary.

                        **Negative Impacts:**
                            - Thoroughly analyze the company policy with respect to the bill to evaluate how it is negatively affected by the bill.
                            - Provide a detailed descriptive analysis of specific points adversely affected, including reference sections if applicable.
                            - Address subcategories of negative impacts separately if necessary.

                        **No Impacts:**
                            - Identify and list those points in the bill that have no impact on company policy, either positively or negatively.

                        **Conclusion:**
                            - Summarize the findings derived from the impact analysis and the assessment of company policies.

                        """
        return final_prompt

    
class guidance_formatiing():

    def __init__(self):
        load_dotenv()
        OPENAI_API_KEY =  os.getenv("OPENAI_API_KEY")
        
        # load a model OpenAI
        self.gpt = models.OpenAI(api_key=OPENAI_API_KEY,model="gpt-3.5-turbo")
    
    def carfting(self,input_data):
        from guidance import models, gen, system, user, assistant
        with system():
            lm = self.gpt +  f"""Your task is to format the user input data according to the given template:

                                Output Template:

                                Output Format:

                                1. **Evaluation of Impact on Company Policies:**
                                    - Positive Impacts:
                                        - Provide a detailed analysis of the positive impacts of the Bill on company policies.
                                        - Include relevant section references.
                                        [Continue this format for all positive impacts]

                                    - Negative Impacts:
                                        - Provide a detailed analysis of the negative impacts of the Bill on company policies.
                                        - Include relevant section references.
                                        [Continue this format for all negative impacts]
                                    
                                    - No Impacts:
                                        - Provide a detailed analysis of the no impacts of the Bill on company policies.
                                        - Include relevant section references.
                                        [Continue this format for all negative impacts]

                                2.  **Conclusion:**
                                    - Summarize the findings from the impact analysis and company policies assessment.
                                    
                                """

        with user():
            lm += f"""This is my input that i needed in proper format: {input_data}"""

        with assistant():
            lm += gen("answer")
        return lm
    
    def post_processing(self, lm):
        text =str(lm)

        # Find the index of the phrase "Bill Summary:"
        last_index = text.rfind("Evaluation of Impact on Company Policies:")

        # Check if the phrase was found
        if last_index != -1:
            # Extract the text after the last "Bill Summary:"
            bill_summary_content = text[last_index:].strip()
            
            
        else:
            print("Evaluation of Impact not found in the text.")
        return bill_summary_content
    
    def post_dict(self,text):
        # Define keywords
        keywords = [
            "Positive Impacts",
            "Negative Impacts",
            "No Impacts",
            "Conclusion",
        ]

        # Initialize the dictionary
        text = text.replace('**', '')
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
        if last_index != -1:
            sections[last_keyword] = text[last_index + len(last_keyword):].strip()
        else:
            sections[last_keyword] = ""
        return sections
    

class postProcess():
    def remove_extra_spaces(self,text):
        text=re.sub(r'\s+', ' ', text)
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\(.*?\)', '', text)
        return text

    def custom_split(self,text,pattern):
        sentences = re.split(pattern, text)[1:]
        return sentences

    def cleaning(self,data):
        filtered_corpus = [sentence for sentence in data if len(sentence.split()) >= 5]
        return filtered_corpus

    def post_processing(self,data):
        corpus = self.remove_extra_spaces(data)

        pattern1 = re.compile(r'\d+\s*\.\s*')
        # pattern2 = re.compile(r'\b-\b')
        pattern2 = re.compile(r'(?<!\w)-(?!\w)')
        # Step 2: Custom split based on "\n<any_number>." or "\n-"
        split_corpus = self.custom_split(corpus,pattern1)
        a=len(split_corpus)
        if a==0:
            split_corpus = self.custom_split(corpus,pattern2)

        final_output=self.cleaning(split_corpus)
        return final_output
    
    def mapping(self,original_dict):
        key_mapping = {'Positive Impacts':'positive_impacts','Negative Impacts':'negative_impacts','No Impacts':'no_impacts'}
        new_dict = {key_mapping.get(old_key, old_key): value for old_key, value in original_dict.items()}
        return new_dict
    
    def post_clean(self, text):
        # Define a regular expression pattern to match the first pattern
        pattern = r'【(.*?)】'
        # Use re.sub to replace the matched pattern with an empty string
        cleaned_text = re.sub(pattern, '', text)
        pattern1 = re.compile(r'\b\d+\.\s*|\s*-\s*')
        # Use the sub function to replace matches with an empty string
        cleaned_text = re.sub(pattern1, '', cleaned_text)
        cleaned_text = cleaned_text.replace('#', '')
        cleaned_text = cleaned_text.replace('<|im_end|>', '')
        cleaned_text = cleaned_text.replace('<|im_end|', '')
        return cleaned_text

    def postprocess_dict(self, input_dict):
        # Iterate through the keys in the dictionary
        for key in input_dict:
            # Apply the cleaning function to the corresponding value
            input_dict[key] = [self.post_clean(text) for text in input_dict[key]]
            filtered_corpus = [sentence for sentence in input_dict[key] if len(sentence.split()) >= 5]
            input_dict[key] = filtered_corpus
        return input_dict
    
    
if __name__ == "__main__":
    start=time.time()
    input_assistant_id="asst_A6gy2UGxeUouZ5AIOjYUPjvG"
    input_assistant_id_code= "" #"asst_xbrR4fukDzUFhd9l0bkQ3ZX8"


    input_file_id=data["file_id"]
    input_client=data["client"]
    input_policies=data["policies"]

    code_interpreter="False"
    policies=data['policies']
    policies = '.\n'.join(policies)

    
    knowledge_assistant = KnowledgeAssistant()
    user_input=knowledge_assistant.prompting(policies)
    thread_id = knowledge_assistant.creating_new_thread(input_file_id)
    result = knowledge_assistant.query_to_assistant(thread_id.id, input_assistant_id, user_input)
    knowledge_assistant.deleting_thread(thread_id.id)
    time_taken_retrieval=time.time()
    retrive= time_taken_retrieval-start
    logger.debug("Result Retrieval : %s", result)
    logger.debug("Result Retrieval Time: %s", retrive)
    
    # # phrases_to_check = ["There is an issue with accessing the file.","The file needs to be reuploaded.","The analysis cannot proceed without the file.","The analysis is currently on hold due to the file access issue.Reuploading the file will allow the analysis to continue.","re-upload the file","the uploaded file cannot be accessed.","document is still inaccessible","access the document","there's is an issue ","issue in accessing the document","access the document.","technical issue", "unable to access", "Could you please upload the file?", "currently unable to retrieve the bill.","technical difficulty","technical difficulties"]
    # # phrases_to_check=["There is an issue with accessing the file.","The file needs to be reuploaded.","The analysis cannot proceed without the file.","The analysis is currently on hold due to the file access issue.Reuploading the file will allow the analysis to continue."]
    
    # # if any(re.search(re.escape(phrase), result.lower()) for phrase in phrases_to_check):
    # #     Loading_instance=KA()
    # #     if data["assistant_id_code"]=="None":
         
    # #         data["assistant_id_code"]=Loading_instance.code_interpret_rescue(data['file_path'])

    # #     code_interpreter="True"
    # #     # thread_id = knowledge_assist.creating_new_thread()
    # #     # data['thread_id']=thread_id.id

    # #     thread_id = knowledge_assistant.creating_new_thread()
    # #     result = knowledge_assistant.query_to_assistant(thread_id, data["assistant_id_code"], user_input)

    # #     time_taken_code_interpreter=time.time()
    # #     code_interpret=time_taken_code_interpreter-start
    # #     logger.debug("Result code_Interpreter : %s", result)
    # #     logger.debug("Result code_Interpreter Time: %s", code_interpret)

    guide=guidance_formatiing()
    result_guide=guide.carfting(result)
    result_guide=guide.post_processing(result_guide)
    dictionary=guide.post_dict(result_guide)
    post_pro=postProcess()
    dictionary=post_pro.mapping(dictionary)
    dictionary["positive_impacts"]=post_pro.post_processing(dictionary["positive_impacts"])
    dictionary["negative_impacts"]=post_pro.post_processing(dictionary["negative_impacts"])
    dictionary["no_impacts"]=dictionary["no_impacts"].rstrip('2.')
    dictionary["no_impacts"]=post_pro.post_processing(dictionary["no_impacts"])

    keys_to_extract = ['positive_impacts', 'negative_impacts','no_impacts']
    new_dict = {key: dictionary[key] for key in keys_to_extract}
    cleaned_dict = post_pro.postprocess_dict(new_dict)
    logger.debug("Final Result  : %s", cleaned_dict)
    time_taken_final=time.time()
   
    result={
        "result":cleaned_dict
        }

    sys.stdout.write(str(json.dumps(result)))
