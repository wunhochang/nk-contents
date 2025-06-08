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
    [Route("api/AccountsProfitLossHist/[action]")]
    public class AccountsProfitLossHistActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        public AccountsProfitLossHistActionController(IHostingEnvironment hostingEnvironment)
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
                AccountsProfitLossHist.GetList(hsCondition, ref result);

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
                if (data["common_code_no"] == null
                    || data["common_code_no"].ToString() == ""
                    || data["common_code_no"].ToString() == "0")
                {
                    id = entity.Insert(data);
                    //id = new AccountsProfitLossHist().Insert(data);
                }
                else
                {
                    id = entity.Update(data);
                    //id = new AccountsProfitLossHist().Update(data);
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

            AccountsProfitLossHist.GetList(hsCondition, ref result);
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
