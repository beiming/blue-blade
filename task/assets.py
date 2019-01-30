import os

from invoke import task


@task
def clean(ctx):
    command = 'rm -rf {}'.format(os.path.join(ctx['app_path'], 'static'))
    print(command)
    ctx.run(command)


@task
def dev(ctx):
    ctx.run('invoke assets.clean')
    os.system('cd {} && yarn dev'.format(os.path.join(ctx['project_root'], 'assets')))


@task
def build(ctx):
    os.system('cd {} && yarn build'.format(os.path.join(ctx['project_root'], 'assets')))
