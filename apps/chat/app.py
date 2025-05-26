import os
from langchain_openai import ChatOpenAI
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import create_react_agent
from langchain.schema.runnable.config import RunnableConfig
from langchain_core.messages import AIMessageChunk, HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient, StdioConnection
from langgraph.checkpoint.memory import MemorySaver
from db_utils import VectorDB
from langchain_openai import OpenAIEmbeddings

import chainlit as cl
from pydantic import SecretStr
from typing import cast

vector_db = VectorDB()
embeddings = OpenAIEmbeddings(
    model="embeddings",  # use env variable
    base_url=os.environ.get("AMAZEEAI_BASE_URL"),
    api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
)


@cl.on_chat_start
async def on_chat_start():
    memory = MemorySaver()

    client = MultiServerMCPClient(
        {
            "drupal": cast(
                StdioConnection,
                {
                    "command": "mcp-graphql",
                    "args": [],
                    "env": {
                        "ENDPOINT": "http://nginx:8080/mcp",
                        "HEADERS": '{"api-key": "8fad39495df277f06a0eb58c1f101029"}',
                        "ALLOW_MUTATIONS": "true",
                    },
                    "transport": "stdio",
                },
            )
        }
    )

    graph = create_react_agent(
        ChatOpenAI(
            model="claude-3-5-sonnet",
            temperature=0,
            base_url=os.environ.get("AMAZEEAI_BASE_URL"),
            api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
        ),
        [],
        checkpointer=memory,
    )

    cl.user_session.set("graph", graph)


@cl.on_message
async def on_message(msg: cl.Message):
    graph = cast(CompiledStateGraph, cl.user_session.get("graph"))
    cb = cl.LangchainCallbackHandler()
    final_answer = cl.Message(content="")
    full_response = ""

    # Generate embedding for the query
    query_embedding = embeddings.embed_query(msg.content)

    # Get similar documents from vector DB
    similar_docs = vector_db.search_similar(query_embedding, limit=5)

    # Create context from similar documents
    context = "\n\n".join([doc["content"] for doc in similar_docs])

    # Create enhanced prompt with context
    enhanced_prompt = f"""Kontextinformationen:
{context}

Benutzerfrage: {msg.content}

Bitte verwenden Sie die obigen Kontextinformationen, um die Frage des Benutzers zu beantworten. Falls der Kontext nicht relevant ist, können Sie ihn ignorieren.

Nachdem Sie Ihre Antwort gegeben haben, schlagen Sie 3 relevante Folgefragen vor, die dem Benutzer helfen, das Thema weiter zu erkunden. Formatieren Sie diese Fragen als Liste.

Mögliche Folgefragen:
# Dein Job
Du bist Kundenberater bei Seipp Wohnen. Deine Aufgabe ist es, Anfragen zu Themen auf der Website von Seipp Wohnen zu Einrichtung, Möbeln, Küchen, Wohnkonzepten, Innenarchitektur, Produkten, und Unternehmen sachlich richtig und in der Sprache des Unternehmens vertriebsstark zu beantworten.

* Sie besitzen eine Ausbildung als Einrichtungsberater/in oder ein Studium der Architektur/Innenarchitektur
* Sie können idealerweise mind. ein Jahr Berufserfahrung in der gehobenen Einrichtungsberatung bzw. einem vergleichbaren Arbeitsumfeld vorweisen
* Sie sprechen perfekt Deutsch, Englisch- und Französischkenntnisse wären wünschenswert
* Sie können Kunden begeistern, sind freundlich, kommunikativ und haben Freude an Design
* Sie verfügen über eine Ausbildung in der Küchenfachberatung, ein Studium der Architektur/Innenarchitektur oder eine Ausbildung in der Bauzeichnung

# Über Seipp als Unternehmen
Mit zwei Standorten in der Doppelstadt Waldshut-Tiengen steht Seipp Wohnen für individuelle Planung und Beratung, umfassenden Service und ein einzigartiges Sortiment, das in Form von attraktiven Wohnsituationen präsentiert wird.

Seipp sorgt für schönes Wohnen – mit vielfältigen Wohn- und Essräumen, komfortablen Schlafzimmereinrichtungen, hochwertigen Küchen, anspruchsvollen Bürolösungen, Beleuchtung und Heimtextilien, Kinder- und Gartenmöbeln.

Über 140 qualifizierte Mitarbeiter widmen sich den Anliegen und Wünschen der Kunden. Ein Team von Inneneinrichtern und Innenarchitekten arbeitet Hand in Hand mit bestens ausgebildeten Monteuren und den Verwaltungsabteilungen, damit Sie sich in Ihrem Zuhause rundum wohlfühlen.
Das Familienunternehmen am Hochrhein im südlichen Schwarzwald wird seit 2009 in vierter Generation geführt.

Täglich arbeiten wir für Ihr Zuhause. Damit alles funktioniert, arbeitet ein großes Team von Versand und Logistik über Monteure bis zum Kundendienst und Einrichtungsberatern sowie Innenarchitekten Hand in Hand.

Wir, das Unternehmen Seipp Wohnen GmbH mit den beiden Häusern in Waldshut-Tiengen, verstehen uns eingebunden in das ökologische Umfeld der Region Hochrhein und möchten unseren aktiven Beitrag dazu leisten, dass diese Region auch für die folgenden Generationen lebenswert bleibt. Seipp Wohnen will aktiv die Langlebigkeit der verkauften Produkte unterstützen. Die daraus resultierende Schonung der natürlichen Ressourcen liegt uns sehr am Herzen.

# Tonalität und Kundenansprache
Bitte verfasse alle Antworten in einem hochwertigen, inspirierenden und persönlichen Sprachstil, der folgende tonale Merkmale aufweist:
* **Kompetent & stilbewusst:** Vermittelt fachliche Expertise in Innenarchitektur, Designklassikern und Einrichtungstrends, ohne belehrend zu wirken.
* **Elegant & emotional ansprechend:** Nutzt eine bildhafte, edle Sprache, die die Vorstellungskraft anregt und Wohnträume greifbar macht.
* **Vertrauensvoll & serviceorientiert:** Kommuniziert freundlich, verbindlich und kundennahe, mit Fokus auf individueller Betreuung und maßgeschneiderten Lösungen.
* **Nachhaltig & qualitätsbewusst**: Hebt Langlebigkeit, Originalität der Produkte und regionale Verantwortung hervor.
Verwende Siezen als Anredeform. Formuliere klare, strukturierte Antworten mit positiver, lösungsorientierter Haltung. Betone stets den ganzheitlichen Service von Seipp Wohnen – von der Planung über Lieferung und Montage bis hin zum After-Sales-Service.
Setze gezielt Begriffe wie maßgeschneiderte Einrichtung, Wohnkonzept, Designklassiker, Inspiration, Komfort und Eleganz, Rundum-sorglos-Service, Innenarchitekten oder Einrichtungsberatung ein – aber ohne Worthülsen oder Werbeübertreibung.
Sprich stets so, als würdest du ein anspruchsvolles, designaffines Publikum beraten, das Wert auf Ästhetik, Qualität und persönliche Betreuung legt.
"""

    async for m, _ in graph.astream(
        {"messages": [HumanMessage(content=enhanced_prompt)]},
        stream_mode="messages",
        config=RunnableConfig(
            callbacks=[cb] if os.environ.get("DEBUG") else [],
            configurable={"thread_id": cl.context.session.id},
        ),
    ):
        if isinstance(m, AIMessageChunk) and m.content:
            content = cast(str, cast(AIMessageChunk, m).content)
            full_response += content
            await final_answer.stream_token(content)

    # Extract follow-up questions from the full response
    follow_up_questions = []
    lines = full_response.split("\n")
    main_response_lines = []

    # Process each line to separate main response from follow-up questions
    for line in lines:
        if line.strip().startswith(("•", "-", "*", "1.", "2.", "3.")):
            question = line.strip().lstrip("•-*123. ")
            if question.endswith("?"):
                follow_up_questions.append(question)
        else:
            main_response_lines.append(line)

    # Update the message content to remove follow-up questions
    final_answer.content = "\n".join(main_response_lines).strip()

    # Create actions for follow-up questions
    actions = []
    for i, question in enumerate(follow_up_questions[:3]):  # Limit to 3 questions
        actions.append(
            cl.Action(
                name="follow_up",  # Changed to a single name for all follow-up actions
                payload={"question": question},
                label=question,
            )
        )

    # Add the actions to the message
    final_answer.actions = actions
    await final_answer.send()


@cl.action_callback("follow_up")
async def on_follow_up(action: cl.Action):
    question = action.payload.get("question", "")
    msg = cl.Message(content=question)
    await on_message(msg)
