from os import environ, path

from flask import Flask
from invoke import Collection

from scripts.utils import get_project_root
from task import misc, i18n, assets

_project_root = get_project_root(__file__)
_conf_file = '{}/conf/{}.py'.format(_project_root, environ.get('ENV') or 'dev')

_app = Flask(__name__)
_app.config.from_pyfile(_conf_file)

ns = Collection.from_module(misc)
ns.configure({
    'config': _app.config,
    'conf_file': _conf_file,
    'project_root': _project_root,
    'app_path': path.join(_project_root, _app.config['APP_NAME'])
})

for module in [i18n, assets]:
    ns.add_collection(Collection.from_module(module))
