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
    [Route("api/User/[action]")]
    public class UserActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        public UserActionController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        [Authorize]
        [ActionName("GetList")]
        public APIResult GetList(string condition, int page, int start, int limit, [FromQuery]string sort)
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
                    List<Hashtable> hsOrderBy = JsonConvert.DeserializeObject<List<Hashtable>>(sort);
                    int loopcount = 0;
                    foreach (Hashtable hs in hsOrderBy)
                    {
                        if (hs.ContainsKey("property") && hs.ContainsKey("direction"))
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

                new GAPI.Entity.User().GetList(hsCondition, ref result);

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

        [HttpGet("{user_id}")]
        [Authorize]
        [ActionName("UserInfo")]
        public APIResult UserInfo(string user_id)
        {
            try
            {
                CheckAuthNLogging(user_id, "Get");

                result.Data = (entity as User).GetUserInfoByID(user_id);
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

        [HttpGet("{user_id}")]
        [ActionName("IDCheck")]
        public APIResult IDCheck(string user_id)
        {
            try
            {
                result.Data = (entity as User).IdCheck(user_id);
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

        [HttpGet("{type_name}")]
        [ActionName("MailCheck")]
        public APIResult MailCheck(string type_name)
        {
            try
            {
                result.Data = (entity as User).MailCheck(type_name);
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
        [ActionName("Save")]
        public APIResult Save([FromBody]string condition)
        {
            try
            {
                string jsonData = condition;
                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);

                AddDefaultParams(data);
                decimal newID = 0;
                if (data["user_no"] == null
                                    || data["user_no"].ToString() == ""
                                    || data["user_no"].ToString() == "0")
                {

                    if (data["user_pwd"] == null
                                    || data["user_pwd"].ToString() == ""
                                    || data["user_pwd"].ToString() == "0")
                    {
                        data.Add("user_pwd", "1111");
                    }
                    newID = (entity as User).Insert(data);
                }
                else
                {
                    newID = (entity as User).Update(data);
                }
                result.Success = true;
                result.NewID = newID;
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
        [ActionName("UserUpdate")]
        public APIResult UserUpdate([FromBody]string condition)
        {
            try
            {
                string jsonData = condition;
                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);

                AddDefaultParams(data);
                decimal newID = (entity as User).UserUpdate(data);
                result.Success = true;
                result.NewID = newID;
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
        [ActionName("InitPasswd")]
        public APIResult InitPasswd([FromBody]string condition)
        {
            try
            {
                string jsonData = condition;
                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);
                AddDefaultParams(data);
                data.Add("user_pwd", "1111");
                decimal newID = (entity as User).InitPasswd(data);
                result.Success = true;
                result.NewID = newID;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }
            return result;
        }

        [HttpGet]
        //[Authorize]
        [ActionName("ExcelDownload")]
        public IActionResult ExcelDownload(string condition)
        {
            //CheckAuthNLogging(value);
            var hsCondition = new Hashtable();
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }
            List<Hashtable> excelcolumns = new List<Hashtable>();
            if (hsCondition["excelcolumns"] != null && DBUtils.DataToString(hsCondition["excelcolumns"]) != "")
            {
                excelcolumns = JsonConvert.DeserializeObject<List<Hashtable>>(hsCondition["excelcolumns"].ToString());
            }

            hsCondition.Add("ordby", " ORDER BY 1 DESC");
            /*페이지관련 정보 처리부분*/
            hsCondition.Add("page", 1);
            hsCondition.Add("start", 0);
            hsCondition.Add("limit", 0);
            hsCondition.Add("list_type", "EXCEL");

            new GAPI.Entity.User().GetList(hsCondition, ref result);
            List<Hashtable> list = (List<Hashtable>)result.Data;
            DateTime now = DateTime.Now;
            string this_date = now.ToString("yyyyMMddTHHmmssfff");

            var fileDownloadName = "data.xlsx";
            var reportsFolder = "reports";

            if (hsCondition["excelname"] != null && DBUtils.DataToString(hsCondition["excelname"]) != "")
            {
                fileDownloadName = hsCondition["excelname"] + "_" + this_date + ".xlsx";
            }
            else
            {
                fileDownloadName = "RAWDATA_" + this_date + ".xlsx";
            }

            ExcelMakeEntity excelMakeEntity = new ExcelMakeEntity();

            using (var package = excelMakeEntity.createExcelPackage(list, excelcolumns))
            {
                package.SaveAs(new FileInfo(Path.Combine(_hostingEnvironment.WebRootPath, reportsFolder, fileDownloadName)));
            }
            result.Success = true;

            return File($"~/{reportsFolder}/{fileDownloadName}", XlsxContentType, fileDownloadName);

        }

    }
}
