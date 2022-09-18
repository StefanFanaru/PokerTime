using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace PokerTime.Infrastructure.Helpers
{
    public static class HttpClientExtensions
    {
        public static async Task<T> GetAsync<T>(this HttpClient client, string requestUri)
        {
            var response = await client.GetStringAsync(requestUri);
            return response.FromJson<T>();
        }

        public static async Task<T> ReadAsync<T>(this Task<HttpResponseMessage> responseTask)
        {
            await responseTask.EnsureSuccessAsync();

            var response = await responseTask;
            var content = await response.Content.ReadAsStringAsync();

            return content.FromJson<T>();
        }

        public static async Task EnsureSuccessAsync(this Task<HttpResponseMessage> responseTask)
        {
            var response = await responseTask;

            if (response.StatusCode == HttpStatusCode.BadRequest && response.Content != null)
            {
                var body = await response.Content.ReadAsStreamAsync();
                throw new HttpRequestException($"Response Status code: 400 - Body: {body}");
            }

            response.EnsureSuccessStatusCode();
        }
    }
}