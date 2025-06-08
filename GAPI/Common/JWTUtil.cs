using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GAPI.Common
{
    public class JWTUtil
    {
        internal static decimal? GetUserNo(ClaimsPrincipal user)
        {
            var sidClaim = user.Claims.Where(c => c.Type == ClaimTypes.Sid).ToList();

            if (sidClaim == null  || sidClaim.Count == 0)
                return null;

            decimal user_no = -1;

            if(decimal.TryParse(sidClaim[0].Value, out user_no) == false)
                return null;

            if (user_no > 0)
                return user_no;

            return null;
        }
    }
}
