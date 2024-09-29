import json


# uwsgi --http :9090 --plugin python --wsgi-file chat.py

# import chat_signaling.chat
# if environ.get('PATH_INFO').startswith('/chat-signaling'):
#     yield chat_signaling.chat.application(environ, start_response)

def chat_signaling_request(method, path_request, body_request):
    path = path_request[15:]

    body = body_request
    if body_request:
        body = json.loads(body_request)

    status, headers, response = chat_request(method, path, body)

    response_encoded = json.dumps(response).encode('utf8')

    headers.append(('Content-Type', 'application/json'))
    headers.append(('Content-Length', str(len(response_encoded))))
    headers.append(('Access-Control-Allow-Origin', '*'))
    headers.append(('Access-Control-Allow-Headers', '*'))

    return status, headers, response_encoded


def chat_request(method, path, body):
    return '200 OK', [], {}


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
