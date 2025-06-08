using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GAPI.Entity;
using Newtonsoft.Json;
using System.Collections;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using GAPI.Entity.Common;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using GAPI.Common;

namespace GAPI.Controllers
{
    [Route("api/RoleMenuAuth/[action]")]
    public class RoleMenuAuthActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        private new APITreeResult treeresult = new APITreeResult();

        public RoleMenuAuthActionController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        [Authorize]
        [ActionName("GetList")]
        public APITreeResult GetList(string condition, int page, int start, int limit, [FromQuery]string sort)
        {
            try
            {
                CheckAuthNLogging(condition, "Get");

                var hsCondition = new Hashtable();
                /*검색조건 처리부분*/
                if (!string.IsNullOrWhiteSpace(condition))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
                }
                /*리스트 정렬처리 부분*/
                if (!string.IsNullOrWhiteSpace(sort))
                {
                    string ordby = string.Empty;
                    List < Hashtable > hsOrderBy  = JsonConvert.DeserializeObject<List<Hashtable>>(sort);
                    int loopcount = 0;
                    foreach (Hashtable hs in hsOrderBy)
                    {
                        if(hs.ContainsKey("property") && hs.ContainsKey("direction"))
                        {
                            if (loopcount == 0)
                            {
                                ordby = " ORDER BY " + hs["property"].ToString() + " " + hs["direction"].ToString();
                            }
                            else
                            {
                                ordby = ordby + "," + hs["property"].ToString() + " " + hs["direction"].ToString();
                            }
                            loopcount++;
                        }
                    }
                    hsCondition.Add("ordby", ordby);
                }
                else
                {
                    hsCondition.Add("ordby", " ORDER BY 1 DESC");
                }
                /*페이지관련 정보 처리부분*/
                hsCondition.Add("page", page);
                hsCondition.Add("start", start);
                hsCondition.Add("limit", limit);

                //RoleMenuAuth.GetList(hsCondition, ref result);
                treeresult.Data = (entity as RoleMenuAuth).GetList(hsCondition);
                treeresult.Success = true;

                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return treeresult;
        }

        [HttpGet]
        //[Authorize]
        [ActionName("GetComboList")]
        public APIResult GetComboList([FromQuery]string condition)
        {
            try
            {
                //CheckAuthNLogging(condition, "Get");

                var hsCondition = new Hashtable();
                /*검색조건 처리부분*/
                if (!string.IsNullOrWhiteSpace(condition))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
                }
                RoleMenuAuth.GetComboList(hsCondition, ref result);

                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
        [Authorize]
        [ActionName("Save")]
        public APIResult Save([FromBody]string value)
        {
            try
            {
                CheckAuthNLogging(value, "Post");
                string jsonData = value;

                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);
                AddDefaultParams(data);

                if (data["role_no"] != null && DBUtils.DataToString(data["role_no"]) != "")
                {
                    Decimal id = 0;
                    Boolean delete_id = new RoleMenuAuth().Delete(data);

                    if (data["itemlist"] != null && DBUtils.DataToString(data["itemlist"]) != "")
                    {
                        List<Hashtable> list = JsonConvert.DeserializeObject<List<Hashtable>>(data["itemlist"].ToString());
                        foreach (var item in list)
                        {
                            AddDefaultParams(item);
                            //id = entity.Insert(data);
                            id = new RoleMenuAuth().Insert(item);
                            result.Success = true;
                            result.NewID = id;
                        }

                    }

                }

            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        
    }
}
