import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    # Check what the login page actually returns
    'curl -s https://training.kbinhschool.com/login 2>&1 | head -30',
    # Check latest error
    'tail -5 /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/storage/logs/laravel.log 2>&1',
    # Check if assets are accessible
    'curl -s -o /dev/null -w "%{http_code}" https://training.kbinhschool.com/build/assets/app-ByKXq76r.js 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" https://training.kbinhschool.com/build/manifest.json 2>&1',
]

for i, cmd in enumerate(cmds):
    print(f'>>> Command {i+1}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err: print(f'ERR: {err}')
    print('---')
client.close()
