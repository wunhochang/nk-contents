using GAPI.Entity;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace GAPI
{
    public partial class Startup
    {
        // 암호화 키
        private SymmetricSecurityKey signingKey;

        // JWT를 사용하도록 설정
        private void ConfigureAuth(IApplicationBuilder app)
        {
            signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration.GetSection("TokenAuthentication:SecretKey").Value));

            // token 제공자 옵션             
            var tokenProviderOptions = new TokenProviderOptions
            {                
                Path = Configuration.GetSection("TokenAuthentication:TokenPath").Value,
                RefreshPath = Configuration.GetSection("TokenAuthentication:TokenRefreshPath").Value,
                Audience = Configuration.GetSection("TokenAuthentication:Audience").Value,
                Issuer = Configuration.GetSection("TokenAuthentication:Issuer").Value,
                //Expiration = Configuration.GetSection("TokenAuthentication:Expiration").Value,
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
                //IdentityResolver = GetIdentity
                IdentityResolver = new LoginUser().LoginCheck, // 로그인 
                IdentityRefresher = new LoginUser().RefreshToken // 토큰 리프레쉬
            };

            // 토큰 TTL 설정
            string expiration = Configuration.GetSection("TokenAuthentication:Expiration").Value;
            int exp = 0;

            if (int.TryParse(expiration, out exp))
            {
                tokenProviderOptions.Expiration = TimeSpan.FromMinutes(exp);
            }

            // 토큰 Refresh TTL 설정
            string refreshExpiration = Configuration.GetSection("TokenAuthentication:RefreshExpiration").Value;
            int refreshExp = 0;

            if (int.TryParse(refreshExpiration, out refreshExp))
            {
                tokenProviderOptions.RefreshExpiration = TimeSpan.FromMinutes(refreshExp);
            }

            // 토큰의 Validation 을 체크하는 파라미터들
            var tokenValidationParameters = new TokenValidationParameters
            {
                // The signing key must match!
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = signingKey,
                // Validate the JWT Issuer (iss) claim
                ValidateIssuer = true,
                ValidIssuer = Configuration.GetSection("TokenAuthentication:Issuer").Value,
                // Validate the JWT Audience (aud) claim
                ValidateAudience = true,
                ValidAudience = Configuration.GetSection("TokenAuthentication:Audience").Value,
                // Validate the token expiry
                ValidateLifetime = true,
                // If you want to allow a certain amount of clock drift, set that here:
                ClockSkew = TimeSpan.Zero
            };

            // 헤더로 들어온 Bearer 토큰을 체크하는 옵션
            app.UseJwtBearerAuthentication(new JwtBearerOptions
            {
                AutomaticAuthenticate = true,
                AutomaticChallenge = true,
                TokenValidationParameters = tokenValidationParameters
            });

            // 쿠키를 쓸때는 이걸로 - 근데 그런 게 없다네 ㅜㅜ;
            /*
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AutomaticAuthenticate = true,
                AutomaticChallenge = true,
                AuthenticationScheme = "Cookie",
                CookieName = Configuration.GetSection("TokenAuthentication:CookieName").Value,
                TicketDataFormat = new CustomJwtDataFormat(
                    SecurityAlgorithms.HmacSha256,
                    tokenValidationParameters)
            });
          */

            // 이제 적용
            app.UseMiddleware<TokenProviderMiddleware>(Options.Create(tokenProviderOptions));
        }        
    }
}
