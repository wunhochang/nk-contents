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
    [Route("api/AccountsProfitLoss/[action]")]
    public class AccountsProfitLossActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        public AccountsProfitLossActionController(IHostingEnvironment hostingEnvironment)
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

                AccountsProfitLoss.GetList(hsCondition, ref result);

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
        //[Authorize]
        [ActionName("GetMovieRawPrice")]
        public APIResult GetMovieRawPrice([FromQuery]string condition)
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
                AccountsProfitLoss.GetMovieRawPrice(hsCondition, ref result);

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
                if (data["accounts_profit_loss_no"] == null
                    || data["accounts_profit_loss_no"].ToString() == ""
                    || data["accounts_profit_loss_no"].ToString() == "0")
                {
                    id = entity.Insert(data);
                    //id = new AccountsProfitLoss().Insert(data);
                }
                else
                {
                    id = entity.Update(data);
                    //id = new AccountsProfitLoss().Update(data);
                }

                if (data["accounts_profit_loss_list"] != null && data["accounts_profit_loss_list"].ToString() != "")
                {
                    List<Hashtable> accounts_profit_loss_list = JsonConvert.DeserializeObject<List<Hashtable>>(data["accounts_profit_loss_list"].ToString());
                    foreach (var item in accounts_profit_loss_list)
                    {
                        AddDefaultParams(item);
                        if (item["accounts_profit_loss_hist_no"] != null 
                            && item["accounts_profit_loss_hist_no"].ToString() != "0" 
                            && item["accounts_profit_loss_hist_no"].ToString() != "")
                        {
                            Decimal iid = new AccountsProfitLossHist().Update(item);
                        }
                        else
                        {
                            Decimal iid = new AccountsProfitLossHist().Insert(item);
                        }
                    }
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

            hsCondition.Add("ordby", " ORDER BY 1 DESC");
            /*페이지관련 정보 처리부분*/
            hsCondition.Add("page", 1);
            hsCondition.Add("start", 0);
            hsCondition.Add("limit", 0);
            hsCondition.Add("list_type", "EXCEL");

            AccountsProfitLoss.GetList(hsCondition, ref result);
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
