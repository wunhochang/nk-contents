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
    [Route("api/AccountingEndDate/[action]")]
    public class AccountingEndDateActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        public AccountingEndDateActionController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        [Authorize]
        [ActionName("GetTop1List")]
        public APIResult GetList(string condition, int page, int start, int limit, [FromQuery]string sort)
        {
            try
            {
                //CheckAuthNLogging(condition, "Get");
                var hsCondition = new Hashtable();
                if (!string.IsNullOrWhiteSpace(condition))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
                }
                AccountingEndDate.GetTop1List(hsCondition, ref result);
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


        [HttpGet]
        [Authorize]
        [ActionName("CheckEndDate")]
        public APIResult CheckEndDate(string condition, int page, int start, int limit, [FromQuery]string sort)
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
                AccountingEndDate.CheckEndDate(hsCondition, ref result);
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
                Decimal id = entity.Insert(data);
                result.Success = true;
                result.NewID = id;
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
