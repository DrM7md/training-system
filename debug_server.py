import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/',
    'head -20 /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/manifest.json',
    'grep "APP_" /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/.env',
    'cat /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/.htaccess 2>&1 || echo "no htaccess in root"',
    'cat /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/.htaccess 2>&1 | head -30',
    'php /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/artisan route:list --path=dashboard 2>&1',
]

for cmd in cmds:
    print(f'>>> {cmd.split("/")[-1] if "/" in cmd else cmd}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err: print(f'ERR: {err}')
    print('---')
client.close()
