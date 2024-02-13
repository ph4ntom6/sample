import os
import re
import sys
import time
import json
import argparse
import logging
from dotenv import load_dotenv
from openai import OpenAI
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
        print(f"Error creating directory '{directory_path}': {e}")

log_file = parent_directory+'/logs/letter_drafting.log'
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
#--input '{"file_id":"file-7Wr6NbWidPDpWfKsSOXNW1Qr", "clients": [{"id":2,"client_name":"HUBCities Technology","positive_impacts":[":\n1. Financial Responsibility: The bill aligns with Policy 1 by reinforcing the responsibility for restoration, as it requires the acquired to cover all costs of plugging, abandonment, and site restoration, reducing the burden on the state and taxpayers. [Section Reference: 1]\n2. Transparent Recordkeeping: The requirement for the supervisor to maintain and make transfer records available online aligns with the need for transparency in operations, thereby enhancing accountability. [Section Reference: 2]\n\n-"],"negative_impacts":[":\n1. Increased Financial Burden: The new bonding requirements may impose a significant financial burden on companies acquiring wells, especially if the determined bond amount is substantial. [Section Reference: 1]\n2. Operational Delays: The necessity to obtain a determination of the bond amount before acquisition completion could potentially lead to delays in the operational transfer process, impacting Policy 4. [Section Reference: 1]"],"interests_goals":["1. InState agencies should have to give preference to childcare businesses when awarding contracts for childcare services. Our System creates a center to provide childcare businesses with resources and support, such as access to capital, training, and technical assistance. State should have to increase the funding for early childhood education, because it has been shown to have a number of benefits for children, including improved academic achievement, reduced crime rates, and increased lifetime earnings. Funds will help childcare businesses develop their skills and knowledge, improve their quality of care, and become more competitive in the marketplace. During bidding, they have to eliminate all bid preferences and participation goals for childcare businesses."]}], "address_to": "Bill Author", "tone": "Informative", "style": "Critical", "length": "Long", "template": "default",  "talking_points": "", "user_stance": "support", "bill_name":"AB 24, as amended, Haney. Emergency response: opioid antagonist kits."}'

class Letter_Drafting:

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
    
    def creating_new_thread_html(self):
            thread = self.client.beta.threads.create()
            return thread

    def extract_interestAndGoals(self):
            result = ', '.join([impact for client in data["clients"] for impact in client["interests_goals"]])
            return result

    def extract_impacts(self, company, stance):
        if stance == "support" or stance == "request-for-signature":
            result = ', '.join([impact for client in data["clients"] for impact in client["positive_impacts"]])
        elif stance == "oppose" or stance == "request-for-veto":
            result = ', '.join([impact for client in data["clients"] for impact in client["negative_impacts"]])
        return result
    
    # Example usage of loaded_templates
    def loaded_template(self,template_type):
        # Read the JSON data from the file
        with open(parent_directory+'/src/lang/en/templates.json', 'r') as json_file:
            loaded_templates = json.load(json_file)
        if template_type =="default":
            template_type="letter"
        return loaded_templates[template_type]
    
        
    def template_drafting(self,data,impacted_points,draft_sample,interestAndGoals):
        client_names = ', '.join([client["client_name"] for client in data["clients"]])


        prompt = f"""Craft a {data["length"]} {data["template"]} template for the bill named {data["bill_name"]}, tailored to address the specified {impacted_points}.
                    Highlight the key {data["talking_points"]} and prioritize the interests of the designated clients: {client_names}.
                    Along with a focus on their respective interest and Goals {interestAndGoals}.Direct the communication to {data["address_to"]} and maintain a {data["tone"]} tone throughout.
                    Adhere to the {data["style"]} writing style and convey a {data["user_stance"]} stance.
                    
                    
                    Utilize the following sample as a guide for crafting:{draft_sample} 
                    and make sure the output is according to the guide provided for crafting
                    """
        
        return prompt
    # def creating_assistant(self):
    #     promptt=""""You are an AI Assistant tasked with converting user text input into HTML code. Your goal is to generate well-structured HTML markup based on the provided information. Ensure that the generated HTML is syntactically correct and follows best practices.
    #             Expected HTML output:
    #             <html>
    #             <head>
    #                 <title>My Webpage</title>
    #             </head>
    #             <body>
    #                 <p>Hello, World!</p>
    #                 <a href="https://example.com">Visit Example Website</a>
    #             </body>
    #             </html>

    #             Feel free to provide more details and examples to guide the AI in generating accurate HTML code based on user input. Make sure the result is in HTML"
    #             """
    #     assistant = self.client.beta.assistants.create(
    #         name="legislative Knowledge Assistant",
    #         instructions=promptt,
    #         tools=[{"type": "code_interpreter"}],
    #         model="gpt-3.5-turbo-1106",
    #     )
    #     # print(assistant.id)
    #     return assistant.id
    
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

    def letter_cleaning(self,text):
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

    def junk_remove(self,corpus):
        lines = corpus.split('\n')
        first_line = lines[0].strip() if lines else ""
        line_contains_double_asterisk = "**" in first_line
        if line_contains_double_asterisk == False:
            if len(first_line) > 25 or first_line == "":
                print('second')
                lines.pop(0)
                first_line = lines[0].strip() if lines else ""
                line_contains_double_asterisk = "**" in first_line
                if line_contains_double_asterisk == False:
                    if len(first_line) > 25 or first_line == "":
                        print("third")
                        lines.pop(0)
                        first_line = lines[0].strip() if lines else ""
                        line_contains_double_asterisk = "**" in first_line
                        if line_contains_double_asterisk == False:
                            if len(first_line) > 25:
                                lines.pop(0)
                return '\n'.join(lines)
            else:
                return corpus
        else:
            return corpus
    def letter_post_processing(self,text):
        text= text.replace("-","")

        last_bracket_index = text.rfind(']')
        # Extract the substring up to the last ']'
        result = text[:last_bracket_index + 1]
        return result

    def html_cleaning(self,text):
        pattern = re.compile(r'<body>.*?</body>', re.DOTALL)

        # Search for the pattern in the HTML string
        match = pattern.search(text)

        if match:
            selected_part = match.group(0)
        # Define a regular expression pattern to match the first pattern
            pattern = r'【(.*?)】'
        # Use re.sub to replace the matched pattern with an empty string
            selected_part = re.sub(pattern, '', selected_part)
        else:
            selected_part= "" 
        return selected_part
    
    def replaced(self,text):
        text=text.replace("\n", "")
        text=text.replace("\t","")
        return text
    

if __name__ == "__main__":
    start=time.time()
    input_assistant_id="asst_A6gy2UGxeUouZ5AIOjYUPjvG"
    input_assistant_id_code="asst_xbrR4fukDzUFhd9l0bkQ3ZX8"
    input_file_id=data["file_id"]
    input_clients=data["clients"]
    
    input_id=input_clients[0]["id"]
    input_client_name=input_clients[0]["client_name"]
    input_positive_impacts=input_clients[0]["positive_impacts"]
    input_negative_impacts=input_clients[0]["negative_impacts"]
    input_interests_goals=input_clients[0]["interests_goals"]

    input_address_to=data["address_to"]
    input_tone=data["tone"]
    input_style=data["style"]
    input_length=data["length"]
    input_template=data["template"]
    input_talking_points=data["talking_points"]
    input_user_stance=data["user_stance"]
    input_bill_name=data["bill_name"]

    check=True
    i=1
    code_interpreter="False"
    result=""
    while check==True:
        check=False
        letter_drafting = Letter_Drafting()

        if len(result.split())< 100:
            i+=1
            thread_id = letter_drafting.creating_new_thread(input_file_id)
            companies=list()
            drafting_sample = letter_drafting.loaded_template(data['template'])
            interestAndGoals= letter_drafting.extract_interestAndGoals()
            impacted_points = letter_drafting.extract_impacts(data, data["user_stance"])
            final_template = letter_drafting.template_drafting(data,impacted_points,drafting_sample,interestAndGoals)
            result = letter_drafting.query_to_assistant(thread_id.id,input_assistant_id,final_template)
            letter_drafting.deleting_thread(thread_id.id)
            # result=result.replace("*", "")

            result=letter_drafting.letter_cleaning(result)
            newline_count = result.count("\n")
            if newline_count <= 4 and i<3:
                check =True
            else:
                time_taken_retrieval=time.time()
                retrive= time_taken_retrieval-start
                logger.debug("Result Retrieval : %s", result)
                logger.debug("Result Retrieval Time: %s", retrive)

    result=letter_drafting.junk_remove(result)
    result=letter_drafting.letter_post_processing(result)
    
    result={
    "result":result
    }
    sys.stdout.write(str(json.dumps(result)))
