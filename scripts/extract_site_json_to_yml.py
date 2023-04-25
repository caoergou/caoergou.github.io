import json
import yaml


def from_yml_to_json(yml: str) -> str:
    sites = yaml.safe_load(yml)

    res = {
        site['taxonomy']: {
            'icon': site['icon'],
            'links': site['links']
        }
        for site in sites
    }
    return json.dumps(res, ensure_ascii=False)


def from_json_to_yml(jstr: str) -> str:
    sites = json.loads(jstr)
    yml_res = []
    for site_type, values in sites.items():
        type_items = {
            'taxonomy': site_type,
            'icon': values.get('icon'),
            'links': values.get('links')
        }
        yml_res.append(type_items)
    return yaml.safe_dump(yml_res, allow_unicode=True)


if __name__ == '__main__':
    import sys

    sites_json_file = 'data/sites.json'
    sites_yml_file = 'site/data/webstack.yml'

    with open(sites_json_file, 'r') as f:
        sites_in_json = f.read()

    sites_in_yml = from_json_to_yml(sites_in_json)

    with open(sites_yml_file, 'w', encoding='utf-8') as f:
        f.write(sites_in_yml)
