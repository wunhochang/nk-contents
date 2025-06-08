using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Primitives;
using System.Security.Principal;
using GAPI.Common;
using System.Collections;
using Microsoft.Extensions.Logging;

namespace GAPI.Entity
{
    internal class LoginUser
    {
        ILogger _logger { get; } = Logging.CreateLogger<Gentity>();

        public string user_id;
        public string password;
        public string table_name = "user";

        public LoginUser()
        {
        }

        public LoginUser(StringValues user_id, StringValues password)
        {
            this.user_id = user_id;
            this.password = password;
        }

        internal Task<ClaimsIdentity> LoginCheck(string user_id, string password)
        {
            try
            {
                using (IDatabase DB = Config.GetDatabase())
                {
                    Hashtable hs = new Hashtable();

                    hs.Add("user_id", user_id);

                    //UserInfo user_info = DB.GetOneRecord("", "", hs);
                    var dt = DB.GetDataTable(table_name, "Info", hs);

                    if (dt != null && dt.Count > 0)
                    {
                        var dr = dt[0];

                        var enc_passwd = dr["user_pwd"].ToString();

                        bool passwordMached = PasswdEncrypt.Check(password, enc_passwd.ToString());

                        if (passwordMached)
                        {
                            return Task.FromResult(
                                new ClaimsIdentity(
                                    new GenericIdentity(user_id, "Token"), 
                                    new[] {
                                            new Claim(ClaimTypes.Role, "ValidUsers"),
                                            new Claim(ClaimTypes.Sid, DBUtils.DataToString(dr["user_no"]))
                                          }
                                )
                            );
                        }
                        else
                        {
                            return Task.FromResult<ClaimsIdentity>(null);
                        }
                    }
                }

                // Account doesn't exists
                return Task.FromResult<ClaimsIdentity>(null);
            }
            catch (Exception ex)
            {
                _logger.LogCritical(new EventId(-1), ex, "Exception");

                return Task.FromResult<ClaimsIdentity>(null);
            }
        }

        internal Task<ClaimsIdentity> RefreshToken(string token, TimeSpan refreshLimit)
        {
            try
            {
                var data = new Hashtable();

                data.Add("token", token);

                if (data.ContainsKey("use_yn") == false)
                    data["use_yn"] = "Y";

                if (data.ContainsKey("del_yn") == false)
                    data["del_yn"] = "N";

                using (var DB = Config.GetDatabase())
                {
                    var dt = DB.GetDataTable("client", "InfoRefreshToken", data);

                    if (dt != null && dt.Count > 0)
                    {
                        var dr = dt[0];

                        var clientNo = DBUtils.DataToString(dr["client_no"]);
                        var userId = DBUtils.DataToString(dr["user_id"]);
                        var loginTime = DBUtils.DataToDateTime(dr["insert_date"]);

                        if ((DateTime.Now - loginTime) > refreshLimit)
                        {
                            return Task.FromResult(new ClaimsIdentity(new GenericIdentity(userId, "Token"), new[]
                            {
                                new Claim(ClaimTypes.Role, "RefreshTimeout")
                            }));
                        }
                        else
                        {
                            return Task.FromResult(new ClaimsIdentity(new GenericIdentity(userId, "Token"), new[]
                            {
                                new Claim(ClaimTypes.Role, "ValidUsers"),
                                new Claim(ClaimTypes.SerialNumber, clientNo),
                                new Claim(ClaimTypes.Sid, DBUtils.DataToString(dr["user_no"]))
                            }));
                        }
                    }
                    else
                    {
                        return Task.FromResult<ClaimsIdentity>(null);
                    }
                }

                //return Task.FromResult<ClaimsIdentity>(null);
            }
            catch (Exception ex)
            {
                _logger.LogCritical(new EventId(-1), ex, "Exception");
                return Task.FromResult<ClaimsIdentity>(null);
            }
        }

    }
}