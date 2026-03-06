# with open("issue_body.txt", "r") as f:
#     issue_content =  f.readall()

issue_content = "### Site URL\n\ntest1\n\n### Logo URL\n\ntest2\n\n### short-description\n\ntest3\n\n### kind\n\nDesktop App, Model"

print(issue_content)

lines = issue_content.split("\n\n")

print(lines)

res = {}
for line in lines:
    if line.startswith("###"):
        key = line[4:]
        res[key] = ''
    else:
        if key == 'kind':
            res[key] = line.split(',')
        else:
            res[key] = line
print(res)