import paramiko
import sys

host = '185.224.137.29'
port = 65002
user = 'u229998316'
password = 'Mm5500!@'
project_dir = '/home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb'

commands = [
    f'cd {project_dir} && pwd && git remote -v',
    f'cd {project_dir} && git fetch origin',
    f'cd {project_dir} && git reset --hard origin/main',
    f'cd {project_dir} && composer install --no-dev --optimize-autoloader 2>&1',
    f'cd {project_dir} && npm install 2>&1',
    f'cd {project_dir} && npm run build 2>&1',
    f'cd {project_dir} && php artisan migrate --force 2>&1',
    f'cd {project_dir} && php artisan config:cache 2>&1',
    f'cd {project_dir} && php artisan route:cache 2>&1',
    f'cd {project_dir} && php artisan view:cache 2>&1',
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f'Connecting to {host}:{port}...')
    client.connect(host, port=port, username=user, password=password, timeout=30)
    print('Connected!\n')

    for cmd in commands:
        print(f'>>> {cmd.split("&& ", 1)[-1] if "&& " in cmd else cmd}')
        stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(out)
        if err:
            print(f'STDERR: {err}')
        exit_code = stdout.channel.recv_exit_status()
        if exit_code != 0:
            print(f'Exit code: {exit_code}')
        print('---')
finally:
    client.close()
    print('\nDone!')
