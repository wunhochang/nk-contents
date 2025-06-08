using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GAPI
{
    public class TokenProviderOptions
    {
        /// <summary>
        /// 토큰 요청 받을 Path
        /// appsettings.json 설정에서 변경한다.
        /// </summary>
        /// <remarks>The default path is <c>/token</c>.</remarks>
        public string Path { get; set; } = "/token";

        /// <summary>
        /// 토큰 갱신 요청 받을 Path
        /// appsettings.json 설정에서 변경한다.
        /// </summary>
        public string RefreshPath { get; set; } = "/tokenRefresh";

        /// <summary>
        ///  The Issuer (iss) claim for generated tokens.
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// The Audience (aud) claim for the generated tokens.
        /// </summary>
        public string Audience { get; set; }

        /// <summary>
        /// The expiration time for the generated tokens.
        /// 토큰 만료 시간
        /// </summary>
        /// <remarks>The default is five minutes (300 seconds).</remarks>
        public TimeSpan Expiration { get; set; } = TimeSpan.FromMinutes(5);

        /// <summary>
        /// 토큰 갱신 만료 시간
        /// </summary>
        public TimeSpan RefreshExpiration { get; set; } = TimeSpan.FromMinutes(50);

        /// <summary>
        /// The signing key to use when generating tokens.
        /// </summary>
        public SigningCredentials SigningCredentials { get; set; }

        /// <summary>
        /// Resolves a user identity given a username and password.
        /// </summary>
        public Func<string, string, Task<ClaimsIdentity>> IdentityResolver { get; set; }

        /// <summary>
        /// 토큰 리프레쉬 하는 function
        /// </summary>
        public Func<string, TimeSpan, Task<ClaimsIdentity>> IdentityRefresher { get; set; }

        /// <summary>
        /// Generates a random value (nonce) for each generated token.
        /// </summary>
        /// <remarks>The default nonce is a random GUID.</remarks>
        public Func<Task<string>> NonceGenerator { get; set; }
            = () => Task.FromResult(Guid.NewGuid().ToString());
    }
}
