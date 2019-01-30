from invoke import task

from app import create_app


@task
def server(ctx):
    app = create_app(conf=ctx['conf_file'])
    app.run('0.0.0.0', debug=True, threaded=True)
