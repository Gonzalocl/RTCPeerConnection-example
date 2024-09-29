import json
import string
import random
import datetime
import mysql.connector

# docker run --rm -p 3306:3306 \
#   -e MYSQL_ROOT_PASSWORD=root \
#   -e MYSQL_USER=user \
#   -e MYSQL_PASSWORD=password \
#   -e MYSQL_DATABASE=database \
#   mysql

# uwsgi --http :9090 --plugin python --wsgi-file chat.py

# import chat_signaling.chat
# if environ.get('PATH_INFO').startswith('/chat-signaling'):
#     yield chat_signaling.chat.application(environ, start_response)


new_chat_id_max_attempts = 10
chat_id_length = 64

db = mysql.connector.connect(
    host="localhost",
    user="user",
    password="password",
    database="database"
)
db_cursor = db.cursor()


def chat_signaling_request(method, path_request, body_request):
    if not path_request.startswith('/chat-signaling'):
        status = '404 Not Found'
        headers = []
        response = {}
    else:
        path = path_request[15:]

        body = body_request
        if body_request:
            body = json.loads(body_request)

        try:
            status, headers, response = chat_request(method, path, body)
        except:
            status = '500 Internal Server Error'
            headers = []
            response = {}

    response_encoded = json.dumps(response).encode('utf8')

    headers.append(('Content-Type', 'application/json'))
    headers.append(('Content-Length', str(len(response_encoded))))
    headers.append(('Access-Control-Allow-Origin', '*'))
    headers.append(('Access-Control-Allow-Headers', '*'))
    headers.append(('Access-Control-Allow-Methods', '*'))

    return status, headers, response_encoded


def chat_request(method, path, body):
    if method == 'OPTIONS':
        return '200 OK', [], {}

    if path == '/offer':
        if method == 'POST':
            return post_offer(body)
        return '405 Method Not Allowed', [], {}

    chat_id = path[1:path.find('/', 1)]

    if path[len(chat_id) + 1:] == '/offer':
        if method == 'GET':
            return get_offer(chat_id)
        return '405 Method Not Allowed', [], {}

    if path[len(chat_id) + 1:] == '/answer':
        if method == 'PUT':
            return put_answer(chat_id, body)
        if method == 'GET':
            return get_answer(chat_id)
        return '405 Method Not Allowed', [], {}

    return '404 Not Found', [], {}


def post_offer(body):
    chat = {'date': datetime.datetime.now(datetime.timezone.utc),
            'offer': body['offer'],
            'answer': None}

    stored_chat = db_store_chat(chat)

    if not stored_chat:
        return '500 Internal Server Error', [], {}

    return '200 OK', [], {'chat_id': stored_chat['id']}


def get_offer(chat_id):
    chat = db_get_chat(chat_id)

    if not chat:
        return '404 Not Found', [], {}

    return '200 OK', [], {'offer': chat[2]}


def put_answer(chat_id, body):
    chat = {'id': chat_id,
            'date': datetime.datetime.now(datetime.timezone.utc),
            'offer': None,
            'answer': body['answer']}

    db_store_chat(chat)

    return '200 OK', [], {}


def get_answer(chat_id):
    chat = db_get_chat(chat_id)

    if not chat:
        return '404 Not Found', [], {}

    db_delete_chat(chat_id)
    return '200 OK', [], {'answer': chat[3]}


def application(env, start_response):
    method = env.get('REQUEST_METHOD')
    path = env.get('PATH_INFO')
    body = read_body(env)

    status, headers, response = chat_signaling_request(method, path, body)

    start_response(status, headers)
    return response


def read_body(env):
    try:
        request_body_size = int(env.get('CONTENT_LENGTH', 0))
    except ValueError:
        request_body_size = 0

    if request_body_size == 0:
        return None

    return env.get('wsgi.input').read(request_body_size)


def get_new_chat_id():
    for _ in range(new_chat_id_max_attempts):
        chat_id = get_random_chat_id()
        if not db_is_chat_id_present(chat_id):
            return chat_id
    return None


def get_random_chat_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=chat_id_length))


def db_store_chat(chat):
    if 'id' not in chat or not chat['id']:
        chat['id'] = get_new_chat_id()
        if not chat['id']:
            return None

    sql = 'REPLACE INTO chats (id, date, offer, answer) VALUES (%s, %s, %s, %s)'
    val = (chat['id'], chat['date'], chat['offer'], chat['answer'])
    db_cursor.execute(sql, val)
    db.commit()
    return chat


def db_get_chat(chat_id):
    sql = 'SELECT * FROM chats WHERE id = %s'
    val = (chat_id,)
    db_cursor.execute(sql, val)
    return db_cursor.fetchone()


def db_delete_chat(chat_id):
    sql = 'DELETE FROM chats WHERE id = %s'
    val = (chat_id,)
    db_cursor.execute(sql, val)
    db.commit()


def db_is_chat_id_present(chat_id):
    return True if db_get_chat(chat_id) else False
