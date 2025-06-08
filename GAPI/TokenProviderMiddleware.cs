using GAPI.Entity;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace GAPI
{
    /// <summary>
    /// JWT 를 사용하기 위한 미들웨어
    /// </summary>
    public class TokenProviderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly TokenProviderOptions _options;
        private readonly JsonSerializerSettings _serializerSettings;

        public TokenProviderMiddleware(
            RequestDelegate next,
            IOptions<TokenProviderOptions> options)
        {
            _next = next;

            _options = options.Value;
            ThrowIfInvalidOptions(_options);

            _serializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented
            };
        }

        public Task Invoke(HttpContext context)
        {
            if (context.Request.Path.Equals(_options.RefreshPath, StringComparison.Ordinal))
            {
                // Request must be POST with Content-Type: application/x-www-form-urlencoded
                if (!context.Request.Method.Equals("POST")
                   /*|| !context.Request.HasFormContentType*/)
                {
                    context.Response.StatusCode = 401;

                    if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                    context.Response.Headers.Add("WWW-Authenticate", "Request error=\"invalid_method\", error_description=\"Token refresh need POST.\"");

                    return context.Response.WriteAsync("Token refresh need POST.");
                }

                return RefreshToken(context);
            }
            else if (context.Request.Path.Equals(_options.Path, StringComparison.Ordinal))
            {
                // Request must be POST with Content-Type: application/x-www-form-urlencoded
                if (!context.Request.Method.Equals("POST")
                   /*|| !context.Request.HasFormContentType*/)
                {
                    context.Response.StatusCode = 401;

                    if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                    context.Response.Headers.Add("WWW-Authenticate", "Request error=\"invalid_method\", error_description=\"Token request need POST.\"");

                    return context.Response.WriteAsync("Token request need POST.");
                }

                return GenerateToken(context);
            }
            else
            { 
                try
                {
                    if (context.Request.Headers["Authorization"].Count > 0)
                    {
                        var auth = context.Request.Headers["Authorization"][0];
                        var token = auth.ToString().Replace("Bearer ", "");
                    }
                }
                catch(Exception)
                {

                }

                return _next(context);
            }            
        }

        private async Task RefreshToken(HttpContext context)
        {
            if (context.Request.Headers["Authorization"].Count == 0)
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"The token is empty\"");

                await context.Response.WriteAsync("The token is empty");

                return;
            }

            var auth = context.Request.Headers["Authorization"][0];
            var token = auth.ToString().Replace("Bearer ", "");

            if (string.IsNullOrWhiteSpace(token) == true)
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"The token is empty\"");

                await context.Response.WriteAsync("The token is empty");

                return;
            }
            
            var identity = await _options.IdentityRefresher(token, _options.RefreshExpiration);

            if (identity == null)
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"Invalid token to refresh.\"");

                await context.Response.WriteAsync("Invalid token to refresh.");
                return;
            }

            var roles = identity.Claims.Where(c => c.Type == ClaimTypes.Role).ToList();
            
            var timeout = roles.Where(r => r.Value == "RefreshTimeout").Count();

            if(timeout > 0)
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"Token refresh ttl finished.\"");

                await context.Response.WriteAsync("Token refresh ttl finished.");

                return;
            }


            var clients = identity.Claims.Where(c => c.Type == ClaimTypes.SerialNumber).ToList();

            if(clients.Count == 0)
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Bearer error=\"invalid_token\", error_description=\"Client not found.\"");

                await context.Response.WriteAsync("client not found.");

                return;
            }

            var client_no = clients[0].Value;

            var now = DateTime.UtcNow;

            // Specifically add the jti (nonce), iat (issued timestamp), and sub (subject/user) claims.
            // You can add other claims here, if you want:
            var claims = new List<Claim>();

            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, identity.Name));
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, await _options.NonceGenerator()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUniversalTime().ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64));

            foreach (var idClaim in identity.Claims.ToArray())
            {
                claims.Add(idClaim);
            }

            // Create the JWT and write it to a string
            var jwt = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims.ToArray(),
                notBefore: now,
                expires: now.Add(_options.Expiration),
                signingCredentials: _options.SigningCredentials);
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            // token을 저장할까나?? 사용자 정보 하구 같이? [
            Hashtable hs = new Hashtable();

            hs.Add("token", encodedJwt);
            hs.Add("client_no", client_no);

            new Client().InsertTokenUniq(hs);
            // ]

            var response = new
            {
                access_token = encodedJwt,
                expires_in = (int)_options.Expiration.TotalSeconds
            };

            // Serialize and return the response
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonConvert.SerializeObject(response, _serializerSettings));
        }

        private async Task GenerateToken(HttpContext context)
        {
            LoginUser user = new LoginUser();

            if (context.Request.ContentType.Contains("application/json"))
            {
                user = await ReadUserData(context);
            }
            else if(context.Request.ContentType == "application/x-www-form-urlencoded")
            {
                user = new LoginUser(context.Request.Form["user_id"], context.Request.Form["password"]);
            }
            else
            {
                context.Response.StatusCode = 401;
                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Request error=\"invalid_content_type\", error_description=\"Invalid Content type.\"");

                await context.Response.WriteAsync("Invalid Auth type.");
                return;
            }

            var identity = await _options.IdentityResolver(user.user_id, user.password);
            if (identity == null)
            {
                context.Response.StatusCode = 401;

                if (context.Response.Headers.ContainsKey("WWW-Authenticate")) context.Response.Headers.Remove("WWW-Authenticate");
                context.Response.Headers.Add("WWW-Authenticate", "Request error=\"invalid_id_password\", error_description=\"Invalid user id or password.\"");

                await context.Response.WriteAsync("Invalid user id or password.");
                return;
            }

            var now = DateTime.UtcNow;

            // Specifically add the jti (nonce), iat (issued timestamp), and sub (subject/user) claims.
            // You can add other claims here, if you want:
            var claims = new List<Claim>();

            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, identity.Name));
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, await _options.NonceGenerator()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUniversalTime().ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64));

            foreach( var idClaim in identity.Claims.ToArray())
            {
                claims.Add(idClaim);
            }

            // Create the JWT and write it to a string
            var jwt = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims.ToArray(),
                notBefore: now,
                expires: now.Add(_options.Expiration),
                signingCredentials: _options.SigningCredentials);
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            // token을 저장할까나?? 사용자 정보 하구 같이? [
            Hashtable hs = new Hashtable();

            hs.Add("token", encodedJwt);
            hs.Add("user_id", identity.Name);

            new Client().InsertTokenUniq(hs);
            // ]

            var response = new
            {
                access_token = encodedJwt,
                expires_in = (int)_options.Expiration.TotalSeconds
            };

            // Serialize and return the response
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonConvert.SerializeObject(response, _serializerSettings));
        }

        private async Task<LoginUser> ReadUserData(HttpContext context)
        {
            try
            {
                var buffer = new byte[Convert.ToInt32(context.Request.ContentLength)];

                await context.Request.Body.ReadAsync(buffer, 0, buffer.Length);

                var body = Encoding.UTF8.GetString(buffer);

                body = body.TrimEnd('\'').TrimEnd('\"').TrimStart('\'').TrimStart('\"');

                var user = JsonConvert.DeserializeObject<LoginUser>(body);

                return user;
            }catch(Exception)
            {
                return null;
            }
        }

        private static void ThrowIfInvalidOptions(TokenProviderOptions options)
        {
            if (string.IsNullOrEmpty(options.Path))
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.Path));
            }

            if (string.IsNullOrEmpty(options.Issuer))
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.Issuer));
            }

            if (string.IsNullOrEmpty(options.Audience))
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.Audience));
            }

            if (options.Expiration == TimeSpan.Zero)
            {
                throw new ArgumentException("Must be a non-zero TimeSpan.", nameof(TokenProviderOptions.Expiration));
            }

            if (options.IdentityResolver == null)
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.IdentityResolver));
            }

            if (options.SigningCredentials == null)
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.SigningCredentials));
            }

            if (options.NonceGenerator == null)
            {
                throw new ArgumentNullException(nameof(TokenProviderOptions.NonceGenerator));
            }
        }

    }
}
