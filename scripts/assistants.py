from dotenv import load_dotenv
from openai import OpenAI
import os
import time
import sys
import json
import argparse

class KnowledgeAssistant:

    def __init__(self):
        load_dotenv()
        openai_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=openai_key)
    def creating_assistant_html(self):
        promptt=""""You are an AI Assistant tasked with converting user text input into HTML code. Your goal is to generate well-structured HTML markup based on the provided information. Ensure that the generated HTML is syntactically correct and follows best practices.
                Expected HTML output:
                <html>
                <head>
                    <title>My Webpage</title>
                </head>
                <body>
                    <p>Hello, World!</p>
                    <a href="https://example.com">Visit Example Website</a>
                </body>
                </html>

                Feel free to provide more details and examples to guide the AI in generating accurate HTML code based on user input. Make sure the result is in HTML"
                """
        assistant = self.client.beta.assistants.create(
            name="legislative Knowledge Assistant HTML generator",
            instructions=promptt,
            tools=[{"type": "code_interpreter"}],
            model="gpt-3.5-turbo-1106",
        )
        # print(assistant.id)
        return assistant.id

    def creating_assistant_retrieval(self):
        assistant = self.client.beta.assistants.create(
            name="legislative Knowledge Assistant",
            instructions="You are a AI Assistent that answers any queries related to California legislative Bills",
            tools=[{"type": "retrieval"}],
            model="gpt-3.5-turbo-1106",

        )
        # print(assistant.id)
        return assistant.id


def creating_assistant_code(self, uploaded_file):
    assistant = self.client.beta.assistants.create(
        name="legislative Knowledge Assistant Code Interpreter",
        instructions="You are a AI Assistent that answers any queries related to California legislative Bills",
        tools=[{"type": "code_interpreter"}],
        model="gpt-3.5-turbo-1106",
    )
    # print(assistant.id)
    return assistant.id

if __name__ == "__main__":
    knowledge=KnowledgeAssistant()
    idd=knowledge.creating_assistant_html()
    result={
        "Assistant_id":idd
        }
    sys.stdout.write(str(json.dumps(result)))