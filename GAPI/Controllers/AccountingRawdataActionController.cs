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

namespace GAPI.Controllers
{
    [Route("api/AccountingRawdata/[action]")]
    public class AccountingRawdataActionController : GController
    {
        private new APIResult result = new APIResult();

        [HttpGet]
        [Authorize]
        [ActionName("GetList")]
        public APIResult GetList(string condition)
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
                AccountingRawdata.GetList(hsCondition, ref result);

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
                Decimal id = 0;
                if (data["accounting_rawdata_no"] == null
                    || data["accounting_rawdata_no"].ToString() == ""
                    || data["accounting_rawdata_no"].ToString() == "0")
                {
                    id = entity.Insert(data);
                    //id = new AccountingRawdata().Insert(data);
                }
                else
                {
                    id = entity.Update(data);
                    //id = new AccountingRawdata().Update(data);
                }
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
