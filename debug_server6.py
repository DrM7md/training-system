import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('185.224.137.29', port=65002, username='u229998316', password='Mm5500!@', timeout=30)

cmds = [
    # List actual asset files on server
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/assets/ | grep app',
    # Check what manifest references
    'grep -o "app-[^\"]*" /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/manifest.json',
    # Check git status on server
    'cd /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb && git log --oneline -3',
    # Count assets
    'ls /home/u229998316/domains/kbinhschool.com/public_html/TrainingWeb/public/build/assets/ | wc -l',
]

for cmd in cmds:
    print(f'>>> {cmd.split("&&")[-1].strip() if "&&" in cmd else cmd.split("/")[-1] if len(cmd) > 80 else cmd}')
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err: print(f'ERR: {err}')
    print('---')
client.close()
