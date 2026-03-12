import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/assets/ | wc -l',
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/assets/ | grep app',
    'curl -s -o /dev/null -w "%{http_code}" https://training.kbinhschool.com/build/assets/app-ByKXq76r.js',
    'curl -s -o /dev/null -w "%{http_code}" https://training.kbinhschool.com/login',
]

for cmd in cmds:
    print(f'>>> {cmd.split("/")[-1] if "assets/" in cmd else cmd[-60:]}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode().strip())
    print('---')
client.close()
