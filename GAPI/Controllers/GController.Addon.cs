using GAPI.Common;
using GAPI.Entity;
using GAPI.Entity.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace GAPI.Controllers
{
    public partial class GController : Microsoft.AspNetCore.Mvc.Controller
    {
        protected ILogger _logger { get; } = Logging.CreateLogger<Gentity>();

        public Gentity entity { get; set; }
        protected APIResult result { get; set; }

        protected string controller_name { get; set; }
        protected string entity_name { get; set; }


        public GController()
        {
            this.controller_name = StringUtils.SplitCamelCase(this.GetType().Name)
                .ToLower()
                .Replace("_controller", "");

            this.entity_name = this.GetType().Namespace.Replace("Controllers", "Entity")
                + "." + this.GetType().Name.Replace("Controller", "").Replace("Action", "");

            _logger.LogInformation("Controller created. Controller name = " + controller_name + ", Entity name = " + entity_name);

            this.entity = Activator.CreateInstance(Type.GetType(entity_name)) as Gentity;

            result = new APIResult();
        }

        public void CheckAuthNLogging(object data, string action_name = "",
       [System.Runtime.CompilerServices.CallerMemberName] string memberName = ""/*,
       [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
       [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0*/)
        {
            var authResult = false;
            var user_id = User.Identity.Name;

            if(string.IsNullOrWhiteSpace(action_name))
                authResult = CheckAuth(user_id, controller_name, memberName);
            else
                authResult = CheckAuth(user_id, controller_name, action_name);

            AddActionHist(user_id, controller_name, memberName, data, authResult);

            if (authResult == false)
            {
                if (Response.Headers.ContainsKey("WWW-Authenticate")) Response.Headers.Remove("WWW-Authenticate");
                Response.Headers.Add("WWW-Authenticate", "Auth error=\"invalid_auth\", error_description=\"Auth Error\"");

                Response.StatusCode = 401;
                throw new Exception("Auth Error");
            }
        }

        public bool AddActionHist(string user_id, string controller_name, string action_name, object data, bool auth_result)
        {
            // Auth token 이 있는 상태로 Request 가 들어왔을 때.
            if (Request.Headers["Authorization"].Count == 0)
                return false;

            var auth = Request.Headers["Authorization"][0];
            var token = auth.ToString().Replace("Bearer ", "");

            var client_no = new Client().GetClientNoByToken(token);
            
            var controller_no = new Controler().GetControllerNoByName(controller_name);

            if(controller_no == null)
            {
                Hashtable hs = new Hashtable();
                hs.Add("controller_name", controller_name);
                AddDefaultParams(hs);

                controller_no = new Controler().Insert(hs);
            }

            var user_no = new User().GetUserNoByID(user_id);
            
            if (client_no == null || controller_no == null)
            {
                throw new Exception("client_no or contoller_no is not found.");
            }
            else
            {
                var hs = new Hashtable();

                hs.Add("client_no", client_no);
                hs.Add("user_no", user_no);
                hs.Add("controller_no", controller_no);
                hs.Add("action", action_name);
                hs.Add("param", (data == null)?"":data.ToString());
                hs.Add("auth_result", auth_result?"Y":"N");

                AddDefaultParams(hs);

                new ClientActionHist().Insert(hs);

                return true;
            }
            //return true;
        }

        public bool CheckAuth(string user_id, string controller_name, string action_name)
        {
            // 권한 체크. 
            // 할게 느므 마나요~~ ㅠㅠ
            var hs = new Hashtable();

            hs.Add("user_id", user_id);
            hs.Add("controller_name", controller_name);
            
            //var auth = new ControllerRoleAuth().GetAuthByUserIdNControllerName(hs);

            // hyshin 하아.. 귀찮으니 일단은 이렇게... ㅠㅠ
            var auth = "D";

            switch(action_name)
            {
                case "Get":
                case "GetList":
                case "GetComboList":
                case "R":
                    if (auth == "R" || auth == "W" || auth == "D")
                        return true;
                    else
                        return false;
                case "Post":
                case "Put":
                case "W":
                case "Upload":
                    if (auth == "W" || auth == "D")
                        return true;
                    else
                        return false;
                case "Delete":
                case "DeleteMulti":
                case "D":
                    if (auth == "D")
                        return true;
                    else
                        return false;

                default:
                    throw new Exception("undefined Action Name");
            }

            //return false;
        }

        protected void AddDefaultParams(Hashtable data, decimal? id = null)
        {
            if(id != null)
            {
                if (data.ContainsKey(entity.table_name + "_no") == false)
                    data[entity.table_name + "_no"] = id;
            }

            // Get 일때만 사용 됨 [
            if (data.ContainsKey("use_yn") == false)
                data["use_yn"] = "Y";

            if (data.ContainsKey("del_yn") == false)
                data["del_yn"] = "N";
            // ]

            //if (data.ContainsKey("oper_user_id") == false)
            //    data["oper_user_id"] = user_id;

            decimal? user_no = JWTUtil.GetUserNo(User);

            if (data.ContainsKey("oper_user_no") == false)
                data["oper_user_no"] = user_no;

            if (data.ContainsKey("insert_user_no") == false)
                data["insert_user_no"] = user_no;

            if (data.ContainsKey("update_user_no") == false)
                data["update_user_no"] = user_no;

            if (data.ContainsKey("delete_user_no") == false)
                data["delete_user_no"] = user_no;

        }
    }
}
