import os
from os import environ

from app import create_app
from scripts.utils import get_project_root

conf = os.getenv('CONF', '{}/conf/{}.py'.format(get_project_root(), environ.get('ENV') or 'dev'))
app = create_app(conf=conf)

if __name__ == "__main__":
    app.run()
