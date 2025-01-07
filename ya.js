const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

class Resource {
  constructor(url, index) {
    this.index = index;
    this.url = url;
  }

  // Method to download a resource
  download(config = {}) {
    return axios({
      url: this.url,
      responseType: 'stream', // Corrected type key to responseType
      ...config
    });
  }
}

class SnapTikClient {
  constructor(config = {}) {
    this.config = {
      baseURL: 'https://dev.snaptik.app', // Base URL for SnapTik API
      ...config,
    };
    this.axios = axios.create(this.config);
  }

  // Method to fetch token from SnapTik
  async get_token() {
    const { data } = await this.axios.get('/');
    const $ = cheerio.load(data);
    return $('input[name="token"]').val();
  }

  // Method to fetch script for a given URL
  async get_script(url) {
    const form = new FormData();
    const token = await this.get_token();

    form.append('token', token);
    form.append('url', url);

    const { data } = await this.axios.post('/abc2.php', form, {
      headers: form.getHeaders(),
    });

    return data;
  }

  // Evaluate the fetched script
  async eval_script(script1) {
    const script2 = await new Promise(resolve => Function('eval', script1)(resolve));

    return new Promise((resolve, reject) => {
      let html = '';
      const env = {
        $: () => Object.defineProperty({
          remove() {},
          style: { display: '' },
        }, 'innerHTML', {
          set: t => (html = t),
        }),
        app: { showAlert: reject },
        document: { getElementById: () => ({ src: '' }) },
        fetch: a => resolve({ html, oembed_url: a }),
        gtag: () => 0,
        Math: { round: () => 0 },
        XMLHttpRequest: function () {
          return { open() {}, send() {} };
        },
        window: { location: { hostname: 'snaptik.app' } },
      };

      Function(...Object.keys(env), script2)(...Object.values(env));
    });
  }

  // Fetch HD video link
  async get_hd_video(token) {
    const { data } = await this.axios.get(`/getHdLink.php?token=${token}`);
    if (data.error) throw new Error(data.error);
    return data.url;
  }

  // Parse HTML to extract video or photo data
  async parse_html(html) {
    const $ = cheerio.load(html);
    const is_video = !$('div.render-wrapper').length;

    if (is_video) {
      const hd_token = $('div.video-links > button[data-tokenhd]').data('tokenhd');
      const hd_url = new URL(await this.get_hd_video(hd_token));
      const token = hd_url.searchParams.get('token');
      const { url } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

      return {
        type: 'video',
        data: {
          sources: [
            url,
            hd_url.href,
            ...$('div.video-links > a:not(a[href="/"])').toArray()
              .map(elem => $(elem).attr('href'))
              .map(x => x.startsWith('/') ? this.config.baseURL + x : x),
          ].map((url, index) => new Resource(url, index)),
        },
      };
    } else {
      const photos = $('div.columns > div.column > div.photo').toArray().map(elem => ({
        sources: [
          $(elem).find('img[alt="Photo"]').attr('src'),
          $(elem).find('a[data-event="download_albumPhoto_photo"]').attr('href'),
        ].map((url, index) => new Resource(url, index)),
      }));

      return {
        type: photos.length === 1 ? 'photo' : 'slideshow',
        data: photos.length === 1 ? { sources: photos[0].sources } : { photos },
      };
    }
  }

  // Main process method to handle the complete flow
  async process(url) {
    const script = await this.get_script(url);
    const { html, oembed_url } = await this.eval_script(script);

    const result = {
      ...(await this.parse_html(html)),
      url,
    };

    result.data.oembed_url = oembed_url;
    return result;
  }
}

module.exports = SnapTikClient;
