from tornado import ioloop, web, template, websocket
import json
import random


class Note(object):
    def __init__(self):
        self.snapshot = None
        self._diffs = []


class Connection(object):
    def __init__(self):
        self._conns = []

    def gen_new_note(self):
        note_id = random.randint(100000, 999999)
        if note_id in self._conns:
            return self.gen_new_note()
        return note_id

    def add_connection(self, note_id, origin):
        if note_id not in self._conns:
            self._conns[note_id] = [{
                'origins': [origin],
                'note': Note(),
            }]
        else:
            self._conns[note_id]['origins'].append(origin)


class HomeTemplateHandler(web.RequestHandler):
    def get(self):
        loader = template.Loader('templates')
        self.write(loader.load('home.html').generate())


class NoteTemplateHandler(web.RequestHandler):
    def get(self, note_id):
        loader = template.Loader('templates')
        self.write(loader.load('note.html').generate(note_id=note_id))


class BaseApiHandler(web.RequestHandler):
    def get(self, *args, **kwargs):
        context = self.get_context(*args, **kwargs)
        self.write(json.dumps(context))


class NoteApiHandler(BaseApiHandler):
    def get_context(self, *args, **kwargs):
        global connection
        note_id = connection.gen_new_note()
        return {
            'note_id': note_id,
            'note_url': '/notes/%d' % note_id,
        }


class MyWSHandler(websocket.WebSocketHandler):
    def open(self):
        print('websocket opened')

    def on_message(self, message):
        self.write_message('You said: ' + message)

    def on_close(self):
        print('websocket closed')


if __name__ == '__main__':
    print('server start')
    connection = Connection()
    application = web.Application([
        (r'/ws', MyWSHandler),
        # (r'/api/notes', NoteApiHandler),
        (r'/api/notes', NoteApiHandler),
        (r'/notes/([0-9]+)', NoteTemplateHandler),
        (r'/(favicon.ico)', web.StaticFileHandler, {'path': 'static'}),
        (r'/static/(.*)', web.StaticFileHandler, {'path': 'static'}),
        (r'/', HomeTemplateHandler),
    ], debug=True)
    application.listen(8888)
    ioloop.IOLoop.current().start()
