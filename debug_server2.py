import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    'tail -50 /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/storage/logs/laravel.log 2>&1',
    'php /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/artisan inertia:check 2>&1 || echo "no inertia check"',
    'cat /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/resources/views/app.blade.php 2>&1',
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/assets/ | head -10',
]

for cmd in cmds:
    print(f'>>> {cmd.split("/")[-1] if "/" in cmd else cmd}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err: print(f'ERR: {err}')
    print('---')
client.close()
