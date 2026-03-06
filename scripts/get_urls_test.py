import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, urlunparse

import asyncio
from fake_useragent import UserAgent

def load_top_cn_sites(filename):
    with open(filename, 'r') as f:
        return set(line.strip() for line in f)
top_sites = load_top_cn_sites('top_sites_cn.txt')


class WebsiteCrawler:

    def __init__(self, base_urls, max_depth):
        self.base_urls = base_urls
        
        self.base_domains = set()
        for base_url in base_urls:
            self.base_domains.add(urlparse(base_url).netloc)
        self.max_depth = max_depth
        self.external_urls = set()
        self.queue = asyncio.Queue()
        self.visited = set()
        self.ua = UserAgent()
        self.save_path = "external_urls_3.txt"
        with open(self.save_path, "r", encoding='utf-8') as f:
            for line in f.readlines():
                self.external_urls.add(line.strip())

    async def write_to_file(self, url):
        with open(self.save_path, "a", encoding='utf-8') as f:
            f.write(url + "\n")

    async def crawl(self, url, depth):
        is_url_in_base_domains = False
        for base_domain in self.base_domains:
            if base_domain in url:
                is_url_in_base_domains = True
                break
        if is_url_in_base_domains or depth > self.max_depth or url in self.visited:
            print(f"Skipping {url}")
            return

        self.visited.add(url)

        async with aiohttp.ClientSession(headers={'User-Agent': self.ua.random}) as session:
            try:
                html = await self.fetch(session, url)
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                return

        soup = BeautifulSoup(html, "html.parser")

        for a_tag in soup.findAll("a"):
            href = a_tag.attrs.get("href")
            if href == "" or href is None:
                continue
            href = urljoin(url, href)
            parsed_href = urlparse(href)
            for base_domain in self.base_domains:
                if base_domain in parsed_href.netloc:
                    continue
            base_url_parts = parsed_href._replace(query="", fragment="")
            base_url = urlunparse(base_url_parts)
            is_top_cn_site = base_url in top_sites
            if is_top_cn_site:
                continue
            if not parsed_href.netloc == "" and parsed_href.scheme in ["http", "https"]:
                if base_url not in self.external_urls:
                    print(f"Found new external link: {href}")
                    self.external_urls.add(base_url)
                    await self.write_to_file(base_url)
            elif parsed_href.scheme in ["http", "https"]:
                await self.queue.put((base_url, depth + 1))

    async def fetch(self, session, url):
        async with session.get(url) as response:
            return await response.text()

    async def run(self):
        for base_url in self.base_urls:
            self.queue.put_nowait((base_url, 1))
        while not self.queue.empty():
            url, depth = await self.queue.get()
            print(f"Fetching {url} at depth {depth}")
            await self.crawl(url, depth)
        print("\n".join(self.external_urls))


async def main():
    with open("external_urls_2.txt", "r", encoding='utf-8') as f:
        start_urls = f.readlines()
    start_urls = [url.strip() for url in start_urls if url.strip()!=""]
    crawler = WebsiteCrawler(start_urls, 3)
    await crawler.run()



loop = asyncio.get_event_loop()
loop.run_until_complete(main())
