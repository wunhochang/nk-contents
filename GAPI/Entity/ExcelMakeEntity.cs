using GAPI.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Table;
using OfficeOpenXml.Style;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Drawing;

namespace GAPI.Entity
{
    public class ExcelMakeEntity
    {
        public ExcelMakeEntity()
        {
        }

        private string readExcelPackage(FileInfo fileInfo, string worksheetName)
        {
            using (var package = new ExcelPackage(fileInfo))
            {
                var worksheet = package.Workbook.Worksheets[worksheetName];
                int rowCount = worksheet.Dimension.Rows;
                int ColCount = worksheet.Dimension.Columns;

                var sb = new StringBuilder();
                for (int row = 1; row <= rowCount; row++)
                {
                    for (int col = 1; col <= ColCount; col++)
                    {
                        sb.AppendFormat("{0}\t", worksheet.Cells[row, col].Value);
                    }
                    sb.Append(Environment.NewLine);
                }
                return sb.ToString();
            }
        }

        public ExcelPackage createExcelPackageRT01(List<Hashtable> list, List<Hashtable> list2, List<Hashtable> excelcolumns, string condition)
        {
            var package = new ExcelPackage();
            package.Workbook.Properties.Title = "Salary Report";
            package.Workbook.Properties.Author = "Vahid N.";
            package.Workbook.Properties.Subject = "Salary Report";
            package.Workbook.Properties.Keywords = "Salary";

            var globalrowindex = 0;
            var hsCondition = new Hashtable();

            Decimal t_amt = 0;
            Decimal s_amt = 0;
            double s_tax = 0;
            double allTotal = 0;
            string strAmt = "";
            string strSettleAmt = "";

            Decimal rawt_amt = 0;
            Decimal raws_amt = 0;
            string strRawAmt = "";
            string strRawSettleAmt = "";
            /*검색조건 처리부분*/
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }

            // Color colr = System.Drawing.ColorTranslator.FromHtml("#000000");
            var worksheet2 = package.Workbook.Worksheets.Add("정산서");
            var worksheet = package.Workbook.Worksheets.Add("정산내역");
            // hsCondition["excelname"]


            var title = hsCondition["cp_corp_name"].ToString() + " " + hsCondition["st_date"].ToString().Substring(0, 4) + "년 " + hsCondition["st_date"].ToString().Substring(5, 2) + "월 매출 정산서";
            worksheet2.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);


            worksheet2.Cells["B3:F3"].Merge = true;
            worksheet2.Cells[3, 2].Value = title == null ? "" : title;
            //worksheet2.Column(2).Width = 120;
            worksheet2.Cells[3, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[3, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
            // worksheet2.Cells[3, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 18));

            worksheet2.Row(3).Height = 35;
            worksheet2.Row(3).Style.Font.Bold = true;

            using (ExcelRange range = worksheet2.Cells[string.Format("B3:F{0}", '3')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            var sender = "■ 발신 :엔케이컨텐츠";
            worksheet2.Cells["B5:F5"].Merge = true;
            worksheet2.Cells[5, 2].Value = sender == null ? "" : sender;
            worksheet2.Row(5).Height = 20;

            var counter = "■ 정산담당자: 구혜림";
            worksheet2.Cells["B6:F6"].Merge = true;
            worksheet2.Cells[6, 2].Value = counter == null ? "" : counter;
            worksheet2.Row(6).Height = 20;

            var rate = "■ 정산요율 ";
            worksheet2.Cells["B7:F7"].Merge = true;
            worksheet2.Cells[7, 2].Value = rate == null ? "" : rate;
            worksheet2.Row(7).Height = 20;

            worksheet2.Cells[8, 3].Value = "VOD,PPV 서비스";
            worksheet2.Cells[8, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            worksheet2.Cells[8, 4].Value = "";
            worksheet2.Cells[8, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 20;

            worksheet2.Cells[9, 3].Value = "방영권료, 기타단매등";
            worksheet2.Cells[9, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            //worksheet2.Cells[9, 4].Value = "판매금액 기준 80%";
            worksheet2.Cells[9, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 25;

            using (ExcelRange range = worksheet2.Cells[string.Format("C8:D{0}", '9')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            var desc = "■ 정산 내역 ";
            worksheet2.Cells["B11:F11"].Merge = true;
            worksheet2.Cells[11, 2].Value = desc == null ? "" : desc;
            worksheet2.Row(11).Height = 20;



            worksheet2.Row(12).Style.Font.Bold = true;


            worksheet2.Cells[12, 2].Value = "NO";
            //worksheet2.Cells[12, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 3].Value = "컨텐츠명";
            //worksheet2.Cells[12, 3].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 3].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 4].Value = "총매출";
            //worksheet2.Cells[12, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 5].Value = "RS";
            // worksheet2.Cells[12, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 6].Value = "정산금액";
            //worksheet2.Cells[12, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            if (list2 != null && list2.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 13;
                int iidx = 1;
                foreach (Hashtable hs in list2)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();


                        // if(data_index =="min_rate"){
                        //     worksheet2.Cells[8, 4].Value = hs[data_index]==null?"":"총매출 기준 "+hs["min_rate"].ToString()+"%";
                        // }

                        if (data_index != "carryover_amt" && data_index != "movie_name2")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        }
                        if (data_index == "sp_corp_detail_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs["movie_name2"].ToString();
                        }
                        if (data_index == "movie_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : iidx.ToString();
                        }
                        //worksheet2.Cells[rowidx, colidx].Value = hs[data_index]==null?"":hs[data_index].ToString();
                        colidx++;
                        // Console.WriteLine(data_index+" "+hs[data_index].ToString());
                    }

                    worksheet2.Cells[8, 4].Value = "총매출 기준 " + hs["min_rate"].ToString() + "%";
                    worksheet2.Cells[9, 4].Value = "판매금액 기준 " + hs["max_rate"].ToString() + "%";

                    using (ExcelRange range = worksheet2.Cells[string.Format("B12:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strAmt = worksheet2.Cells[rowidx, 4].Value.ToString();
                    strSettleAmt = worksheet2.Cells[rowidx, 6].Value.ToString();

                    worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                    worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

                    t_amt = t_amt + decimal.Parse(strAmt.Replace(",", ""));
                    s_amt = s_amt + decimal.Parse(strSettleAmt.Replace(",", ""));
                    rowidx++;
                    iidx++;
                }
                s_tax = (double)s_amt * (double)0.1;

                allTotal = (double)s_tax + (double)s_amt;
                worksheet2.Cells[rowidx, 3].Value = "합계";
                worksheet2.Cells[rowidx, 4].Value = t_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 6].Value = s_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                globalrowindex = rowidx;
            }

            Console.WriteLine(" rows " + globalrowindex);

            worksheet2.Cells["B12:F12"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B12:F12"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);


            var tax_info = "※세금계산서발행금액 ";
            worksheet2.Cells["B" + globalrowindex + 5 + ":F" + globalrowindex + 5].Merge = true;
            worksheet2.Cells[globalrowindex + 5, 2].Value = tax_info == null ? "" : tax_info;
            worksheet2.Row(globalrowindex + 5).Height = 20;

            //  worksheet2.Row(19).Style.Font.Bold = true;


            worksheet2.Cells["B" + (globalrowindex + 6) + ":C" + (globalrowindex + 6)].Merge = true;//worksheet2.Cells["B24:C24"].Merge = true;
            worksheet2.Cells[globalrowindex + 6, 2].Value = "세금계산서 발행일";
            ///worksheet2.Cells[24, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 6, 4].Value = "공급 가액";
            //worksheet2.Cells[24, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 6, 5].Value = "부가세";
            //worksheet2.Cells[24, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 6, 6].Value = "합계";
            //worksheet2.Cells[24, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells["B" + (globalrowindex + 7) + ":C" + (globalrowindex + 7)].Merge = true;//worksheet2.Cells["B25:C25"].Merge = true;
            worksheet2.Cells[globalrowindex + 7, 2].Value = hsCondition["tax_publish_date"].ToString();  // 계산서 발행일 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 4].Value = s_amt.ToString("#,##0");  // 공급가액 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 5].Value = s_tax.ToString("#,##0");  // 부가세 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 7, 6].Value = allTotal.ToString("#,##0");  // 합계 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            using (ExcelRange range = worksheet2.Cells[string.Format("B" + (globalrowindex + 6) + ":F{0}", globalrowindex + 7)])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);




            using (ExcelRange range = worksheet2.Cells[string.Format("G1:G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
                //  range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            using (ExcelRange range = worksheet2.Cells[string.Format(globalrowindex + 11 + ":G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
            }

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                // worksheet.Range["A1"].font.size = 25;
                // var style = worksheet.Cells[400, 1].Style;
                int idx = 1;
                worksheet.Row(1).Height = 20;
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Font.Size = 10;

                worksheet.Column(1).Width = 8;
                worksheet.Column(2).Width = 50;
                worksheet.Column(3).Width = 30;
                worksheet.Column(4).Width = 12;
                worksheet.Column(5).Width = 8;
                worksheet.Column(6).Width = 12;

                worksheet.Column(1).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(2).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(3).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(4).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Column(5).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(6).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                //
                worksheet.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);

                worksheet.Cells["A1:F1"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A1:F1"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                foreach (Hashtable hs in excelcolumns)
                {
                    //worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    if (hs["ColumnName"].ToString() != "전월잔액" && hs["ColumnName"].ToString() != "컨텐츠명")
                    {
                        worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    }

                    // worksheet.Cells[1, idx].Style.Font.Size = 10;
                    worksheet.Cells[1, idx].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet.Cells[1, idx].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

                    idx++;
                }
            }
            //Add values
            var numberformat = "#,##0";
            var dataCellStyleName = "TableNumber";
            var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            numStyle.Style.Numberformat.Format = numberformat;
            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }

                    using (ExcelRange range = worksheet.Cells[string.Format("A1:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strRawAmt = worksheet.Cells[rowidx, 4].Value.ToString();
                    strRawSettleAmt = worksheet.Cells[rowidx, 6].Value.ToString();


                    rowidx++;


                    rawt_amt = rawt_amt + decimal.Parse(strRawAmt.Replace(",", ""));
                    raws_amt = raws_amt + decimal.Parse(strRawSettleAmt.Replace(",", ""));
                }

                worksheet.Cells[rowidx, 2].Value = "합계";
                worksheet.Cells[rowidx, 4].Value = rawt_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 6].Value = raws_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

            }


            return package;
        }



        public ExcelPackage createExcelPackageRT02(List<Hashtable> list, List<Hashtable> list2, List<Hashtable> excelcolumns, string condition)
        {
            var package = new ExcelPackage();
            package.Workbook.Properties.Title = "Salary Report";
            package.Workbook.Properties.Author = "Vahid N.";
            package.Workbook.Properties.Subject = "Salary Report";
            package.Workbook.Properties.Keywords = "Salary";

            var globalrowindex = 0;
            var hsCondition = new Hashtable();

            Decimal t_amt = 0;
            Decimal s_amt = 0;
            double s_tax = 0;
            double allTotal = 0;
            string strAmt = "";
            string strSettleAmt = "";

            Decimal rawt_amt = 0;
            Decimal raws_amt = 0;
            string strRawAmt = "";
            string strRawSettleAmt = "";
            /*검색조건 처리부분*/
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }

            // Color colr = System.Drawing.ColorTranslator.FromHtml("#000000");
            var worksheet2 = package.Workbook.Worksheets.Add("정산서");
            var worksheet = package.Workbook.Worksheets.Add("정산내역");
            // hsCondition["excelname"]


            var title = hsCondition["cp_corp_name"].ToString() + " " + hsCondition["st_date"].ToString().Substring(0, 4) + "년 " + hsCondition["st_date"].ToString().Substring(5, 2) + "월 매출 정산서";
            worksheet2.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);


            worksheet2.Cells["B3:F3"].Merge = true;
            worksheet2.Cells[3, 2].Value = title == null ? "" : title;
            //worksheet2.Column(2).Width = 120;
            worksheet2.Cells[3, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[3, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
            // worksheet2.Cells[3, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 18));

            worksheet2.Row(3).Height = 35;
            worksheet2.Row(3).Style.Font.Bold = true;

            using (ExcelRange range = worksheet2.Cells[string.Format("B3:F{0}", '3')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            var sender = "■ 발신 :엔케이컨텐츠";
            worksheet2.Cells["B5:F5"].Merge = true;
            worksheet2.Cells[5, 2].Value = sender == null ? "" : sender;
            worksheet2.Row(5).Height = 20;

            var counter = "■ 정산담당자: 구혜림";
            worksheet2.Cells["B6:F6"].Merge = true;
            worksheet2.Cells[6, 2].Value = counter == null ? "" : counter;
            worksheet2.Row(6).Height = 20;

            //var rate = "■ 정산요율 : 유통사 매출 기준 80% ";
            worksheet2.Cells["B7:F7"].Merge = true;
            //worksheet2.Cells[7, 2].Value = rate==null?"":rate;
            worksheet2.Row(7).Height = 20;

            //             worksheet2.Cells[8, 3].Value = "VOD,PPV 서비스";
            //             worksheet2.Cells[8, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            //             worksheet2.Cells[8, 4].Value = "총매출 기준 45%";
            //             worksheet2.Cells[8, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 20;

            //             worksheet2.Cells[9, 3].Value = "방영권료, 기타단매등";
            //             worksheet2.Cells[9, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            //             worksheet2.Cells[9, 4].Value = "판매금액 기준 80%";
            //             worksheet2.Cells[9, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 25;

            //             using (ExcelRange range = worksheet2.Cells[string.Format("C8:D{0}", '9')])
            //             {
            //                 range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            //                 range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            //                 range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            //                 range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            //             }

            var desc = "■ 정산 내역 ";
            worksheet2.Cells["B11:F11"].Merge = true;
            worksheet2.Cells[11, 2].Value = desc == null ? "" : desc;
            worksheet2.Row(11).Height = 20;



            worksheet2.Row(12).Style.Font.Bold = true;


            worksheet2.Cells[12, 2].Value = "NO";
            //worksheet2.Cells[12, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 3].Value = "컨텐츠명";
            //worksheet2.Cells[12, 3].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 3].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 4].Value = "NK매출";
            //worksheet2.Cells[12, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 5].Value = "RS";
            // worksheet2.Cells[12, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 6].Value = "정산금액";
            //worksheet2.Cells[12, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            if (list2 != null && list2.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 13;
                int iidx = 1;
                foreach (Hashtable hs in list2)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        if (data_index != "carryover_amt" && data_index != "movie_name2")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        }
                        if (data_index == "sp_corp_detail_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs["movie_name2"].ToString();
                        }
                        if (data_index == "movie_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : iidx.ToString();
                        }
                        //worksheet2.Cells[rowidx, colidx].Value = hs[data_index]==null?"":hs[data_index].ToString();
                        colidx++;
                        // Console.WriteLine(data_index+" "+hs[data_index].ToString());
                    }

                    using (ExcelRange range = worksheet2.Cells[string.Format("B12:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }


                    worksheet2.Cells[7, 2].Value = "■ 정산요율 : 유통사 매출 기준 " + hs["cp_max_rate"].ToString() + "%";


                    strAmt = worksheet2.Cells[rowidx, 4].Value.ToString();
                    strSettleAmt = worksheet2.Cells[rowidx, 6].Value.ToString();

                    worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                    worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

                    t_amt = t_amt + decimal.Parse(strAmt.Replace(",", ""));
                    s_amt = s_amt + decimal.Parse(strSettleAmt.Replace(",", ""));
                    rowidx++;
                    iidx++;
                }
                s_tax = (double)s_amt * (double)0.1;

                allTotal = (double)s_tax + (double)s_amt;
                worksheet2.Cells[rowidx, 3].Value = "합계";
                worksheet2.Cells[rowidx, 4].Value = t_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 6].Value = s_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                globalrowindex = rowidx;
            }

            Console.WriteLine(" rows " + globalrowindex);

            worksheet2.Cells["B12:F12"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B12:F12"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);


            var tax_info = "※세금계산서발행금액 ";
            worksheet2.Cells["B" + globalrowindex + 5 + ":F" + globalrowindex + 5].Merge = true;
            worksheet2.Cells[globalrowindex + 5, 2].Value = tax_info == null ? "" : tax_info;
            worksheet2.Row(globalrowindex + 5).Height = 20;

            //  worksheet2.Row(19).Style.Font.Bold = true;


            worksheet2.Cells["B" + (globalrowindex + 6) + ":C" + (globalrowindex + 6)].Merge = true;//worksheet2.Cells["B24:C24"].Merge = true;
            worksheet2.Cells[globalrowindex + 6, 2].Value = "세금계산서 발행일";
            ///worksheet2.Cells[24, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 6, 4].Value = "공급 가액";
            //worksheet2.Cells[24, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 6, 5].Value = "부가세";
            //worksheet2.Cells[24, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 6, 6].Value = "합계";
            //worksheet2.Cells[24, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells["B" + (globalrowindex + 7) + ":C" + (globalrowindex + 7)].Merge = true;//worksheet2.Cells["B25:C25"].Merge = true;
            worksheet2.Cells[globalrowindex + 7, 2].Value = hsCondition["tax_publish_date"].ToString();  // 계산서 발행일 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 4].Value = s_amt.ToString("#,##0");  // 공급가액 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 5].Value = s_tax.ToString("#,##0");  // 부가세 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 7, 6].Value = allTotal.ToString("#,##0");  // 합계 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            using (ExcelRange range = worksheet2.Cells[string.Format("B" + (globalrowindex + 6) + ":F{0}", globalrowindex + 7)])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);




            using (ExcelRange range = worksheet2.Cells[string.Format("G1:G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
                //  range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            using (ExcelRange range = worksheet2.Cells[string.Format(globalrowindex + 11 + ":G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
            }

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                // worksheet.Range["A1"].font.size = 25;
                // var style = worksheet.Cells[400, 1].Style;
                int idx = 1;
                worksheet.Row(1).Height = 20;
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Font.Size = 10;

                worksheet.Column(1).Width = 8;
                worksheet.Column(2).Width = 50;
                worksheet.Column(3).Width = 30;
                worksheet.Column(4).Width = 12;
                worksheet.Column(5).Width = 8;
                worksheet.Column(6).Width = 12;

                worksheet.Column(1).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(2).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(3).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(4).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Column(5).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(6).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                //
                worksheet.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);

                worksheet.Cells["A1:F1"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A1:F1"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                foreach (Hashtable hs in excelcolumns)
                {
                    //worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    if (hs["ColumnName"].ToString() != "전월잔액" && hs["ColumnName"].ToString() != "컨텐츠명")
                    {
                        worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    }

                    if (hs["ColumnName"].ToString() == "총매출")
                    {
                        worksheet.Cells[1, idx].Value = "NK매출";
                    }

                    // worksheet.Cells[1, idx].Style.Font.Size = 10;
                    worksheet.Cells[1, idx].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet.Cells[1, idx].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

                    idx++;
                }
            }
            //Add values
            var numberformat = "#,##0";
            var dataCellStyleName = "TableNumber";
            var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            numStyle.Style.Numberformat.Format = numberformat;
            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }

                    using (ExcelRange range = worksheet.Cells[string.Format("A1:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strRawAmt = worksheet.Cells[rowidx, 4].Value.ToString();
                    strRawSettleAmt = worksheet.Cells[rowidx, 6].Value.ToString();


                    rowidx++;


                    rawt_amt = rawt_amt + decimal.Parse(strRawAmt.Replace(",", ""));
                    raws_amt = raws_amt + decimal.Parse(strRawSettleAmt.Replace(",", ""));
                }

                worksheet.Cells[rowidx, 2].Value = "합계";
                worksheet.Cells[rowidx, 4].Value = rawt_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 6].Value = raws_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

            }


            return package;
        }


        public ExcelPackage createExcelPackageRT03(List<Hashtable> list, List<Hashtable> list2, List<Hashtable> excelcolumns, string condition)
        {
            var package = new ExcelPackage();
            package.Workbook.Properties.Title = "Salary Report";
            package.Workbook.Properties.Author = "Vahid N.";
            package.Workbook.Properties.Subject = "Salary Report";
            package.Workbook.Properties.Keywords = "Salary";

            var globalrowindex = 0;
            var hsCondition = new Hashtable();

            Decimal t_amt = 0;
            Decimal s_amt = 0;
            Decimal carry_amt = 0;
            double s_tax = 0;
            double allTotal = 0;
            string strAmt = "";
            string strSettleAmt = "";
            string strCarryAmt = "";

            Decimal rawt_amt = 0;
            Decimal raws_amt = 0;
            string strRawAmt = "";
            string strRawSettleAmt = "";
            /*검색조건 처리부분*/
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }

            // Color colr = System.Drawing.ColorTranslator.FromHtml("#000000");
            var worksheet2 = package.Workbook.Worksheets.Add("정산서");
            var worksheet = package.Workbook.Worksheets.Add("정산내역");
            // hsCondition["excelname"]


            var title = hsCondition["cp_corp_name"].ToString() + " " + hsCondition["st_date"].ToString().Substring(0, 4) + "년 " + hsCondition["st_date"].ToString().Substring(5, 2) + "월 매출 정산서";
            worksheet2.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);


            worksheet2.Cells["B3:F3"].Merge = true;
            worksheet2.Cells[3, 2].Value = title == null ? "" : title;
            //worksheet2.Column(2).Width = 120;
            worksheet2.Cells[3, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[3, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
            // worksheet2.Cells[3, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 18));

            worksheet2.Row(3).Height = 35;
            worksheet2.Row(3).Style.Font.Bold = true;

            using (ExcelRange range = worksheet2.Cells[string.Format("B3:F{0}", '3')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            var sender = "■ 발신 :엔케이컨텐츠";
            worksheet2.Cells["B5:F5"].Merge = true;
            worksheet2.Cells[5, 2].Value = sender == null ? "" : sender;
            worksheet2.Row(5).Height = 20;

            var counter = "■ 정산담당자: 구혜림";
            worksheet2.Cells["B6:F6"].Merge = true;
            worksheet2.Cells[6, 2].Value = counter == null ? "" : counter;
            worksheet2.Row(6).Height = 20;

            var rate = "■ 정산요율 ";
            worksheet2.Cells["B7:F7"].Merge = true;
            worksheet2.Cells[7, 2].Value = rate == null ? "" : rate;
            worksheet2.Row(7).Height = 20;

            worksheet2.Cells[8, 3].Value = "VOD,PPV 서비스";
            worksheet2.Cells[8, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            worksheet2.Cells[8, 4].Value = "총매출 기준 45%";
            worksheet2.Cells[8, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 20;

            worksheet2.Cells[9, 3].Value = "방영권료, 기타단매등";
            worksheet2.Cells[9, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            worksheet2.Cells[9, 4].Value = "판매금액 기준 80%";
            worksheet2.Cells[9, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 25;

            using (ExcelRange range = worksheet2.Cells[string.Format("C8:D{0}", '9')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            var desc = "■ 정산 내역 ";
            worksheet2.Cells["B11:F11"].Merge = true;
            worksheet2.Cells[11, 2].Value = desc == null ? "" : desc;
            worksheet2.Row(11).Height = 20;



            worksheet2.Row(12).Style.Font.Bold = true;


            worksheet2.Cells[12, 2].Value = "NO";
            //worksheet2.Cells[12, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 3].Value = "컨텐츠명";
            //worksheet2.Cells[12, 3].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 3].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 4].Value = "총매출";
            //worksheet2.Cells[12, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 5].Value = "RS";
            // worksheet2.Cells[12, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 6].Value = "정산금액";
            //worksheet2.Cells[12, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            if (list2 != null && list2.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 13;
                int iidx = 1;
                foreach (Hashtable hs in list2)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        if (data_index != "carryover_amt" && data_index != "movie_name2")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        }
                        if (data_index == "sp_corp_detail_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs["movie_name2"].ToString();
                        }
                        if (data_index == "movie_name")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : iidx.ToString();
                        }
                        //worksheet2.Cells[rowidx, colidx].Value = hs[data_index]==null?"":hs[data_index].ToString();
                        colidx++;
                        // Console.WriteLine(data_index+" "+hs[data_index].ToString());
                    }

                    worksheet2.Cells[8, 4].Value = "총매출 기준 " + hs["min_rate"].ToString() + "%";
                    worksheet2.Cells[9, 4].Value = "판매금액 기준 " + hs["max_rate"].ToString() + "%";

                    using (ExcelRange range = worksheet2.Cells[string.Format("B12:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strAmt = worksheet2.Cells[rowidx, 4].Value.ToString();
                    strSettleAmt = worksheet2.Cells[rowidx, 6].Value.ToString();

                    worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                    worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

                    t_amt = t_amt + decimal.Parse(strAmt.Replace(",", ""));
                    s_amt = s_amt + decimal.Parse(strSettleAmt.Replace(",", ""));

                    carry_amt = decimal.Parse(hs["carryover_amt"].ToString());
                    rowidx++;
                    iidx++;

                }
                s_tax = (double)carry_amt - (double)s_amt;

                // allTotal = (double)s_tax+(double)s_amt;
                worksheet2.Cells[rowidx, 3].Value = "합계";
                worksheet2.Cells[rowidx, 4].Value = t_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 6].Value = s_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                globalrowindex = rowidx;
            }

            Console.WriteLine(" rows " + globalrowindex);

            worksheet2.Cells["B12:F12"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B12:F12"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);


            var tax_info = "※선급금 잔액 ";
            worksheet2.Cells["B" + globalrowindex + 5 + ":F" + globalrowindex + 5].Merge = true;
            worksheet2.Cells[globalrowindex + 5, 2].Value = tax_info == null ? "" : tax_info;
            worksheet2.Row(globalrowindex + 5).Height = 20;

            //  worksheet2.Row(19).Style.Font.Bold = true;


            worksheet2.Cells["B" + (globalrowindex + 6) + ":C" + (globalrowindex + 6)].Merge = true;//worksheet2.Cells["B24:C24"].Merge = true;
            worksheet2.Cells[globalrowindex + 6, 2].Value = "전월 잔액";
            ///worksheet2.Cells[24, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 6, 4].Value = "당월 정산 차감액";
            //worksheet2.Cells[24, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[globalrowindex + 6, 5].Value = "당월 잔액";
            //worksheet2.Cells[24, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[globalrowindex + 6, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 6, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            // worksheet2.Cells[globalrowindex+6, 6].Value = "합계";
            // //worksheet2.Cells[24, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            // worksheet2.Cells[globalrowindex+6, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            // worksheet2.Cells[globalrowindex+6, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells["B" + (globalrowindex + 6) + ":C" + (globalrowindex + 6)].Merge = true;//worksheet2.Cells["B24:C24"].Merge = true;
            worksheet2.Cells["E" + (globalrowindex + 6) + ":F" + (globalrowindex + 6)].Merge = true;//worksheet2.Cells["E24:F24"].Merge = true;

            worksheet2.Cells["B" + (globalrowindex + 7) + ":C" + (globalrowindex + 7)].Merge = true;//worksheet2.Cells["B25:C25"].Merge = true;
            worksheet2.Cells["E" + (globalrowindex + 7) + ":F" + (globalrowindex + 7)].Merge = true;//worksheet2.Cells["E25:F25"].Merge = true;

            worksheet2.Cells["B" + (globalrowindex + 7) + ":C" + (globalrowindex + 7)].Merge = true;//worksheet2.Cells["B25:C25"].Merge = true;
            worksheet2.Cells[globalrowindex + 7, 2].Value = carry_amt.ToString("#,##0");  // 계산서 발행일 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 4].Value = s_amt.ToString("#,##0");  // 공급가액 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[globalrowindex + 7, 5].Value = s_tax.ToString("#,##0");  // 부가세 s_amt.ToString("#,##0")
            worksheet2.Cells[globalrowindex + 7, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[globalrowindex + 7, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            // worksheet2.Cells[globalrowindex+7, 6].Value = allTotal.ToString("#,##0");  // 합계 s_amt.ToString("#,##0")
            // worksheet2.Cells[globalrowindex+7, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            // worksheet2.Cells[globalrowindex+7, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            using (ExcelRange range = worksheet2.Cells[string.Format("B" + (globalrowindex + 6) + ":F{0}", globalrowindex + 7)])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B" + globalrowindex + 6 + ":F" + globalrowindex + 6].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);




            using (ExcelRange range = worksheet2.Cells[string.Format("G1:G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
                //  range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            using (ExcelRange range = worksheet2.Cells[string.Format(globalrowindex + 11 + ":G{0}", globalrowindex + 11)])
            {
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
            }

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                // worksheet.Range["A1"].font.size = 25;
                // var style = worksheet.Cells[400, 1].Style;
                int idx = 1;
                worksheet.Row(1).Height = 20;
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Font.Size = 10;

                worksheet.Column(1).Width = 8;
                worksheet.Column(2).Width = 50;
                worksheet.Column(3).Width = 30;
                worksheet.Column(4).Width = 12;
                worksheet.Column(5).Width = 8;
                worksheet.Column(6).Width = 12;

                worksheet.Column(1).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(2).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(3).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(4).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Column(5).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(6).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                //
                worksheet.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);

                worksheet.Cells["A1:F1"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A1:F1"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                foreach (Hashtable hs in excelcolumns)
                {
                    //worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    if (hs["ColumnName"].ToString() != "전월잔액" && hs["ColumnName"].ToString() != "컨텐츠명")
                    {
                        worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    }

                    // worksheet.Cells[1, idx].Style.Font.Size = 10;
                    worksheet.Cells[1, idx].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet.Cells[1, idx].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

                    idx++;
                }
            }
            //Add values
            var numberformat = "#,##0";
            var dataCellStyleName = "TableNumber";
            var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            numStyle.Style.Numberformat.Format = numberformat;
            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }

                    using (ExcelRange range = worksheet.Cells[string.Format("A1:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strRawAmt = worksheet.Cells[rowidx, 4].Value.ToString();
                    strRawSettleAmt = worksheet.Cells[rowidx, 6].Value.ToString();


                    rowidx++;


                    rawt_amt = rawt_amt + decimal.Parse(strRawAmt.Replace(",", ""));
                    raws_amt = raws_amt + decimal.Parse(strRawSettleAmt.Replace(",", ""));
                }

                worksheet.Cells[rowidx, 2].Value = "합계";
                worksheet.Cells[rowidx, 4].Value = rawt_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 6].Value = raws_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

            }


            return package;
        }



        public ExcelPackage createExcelPackageRT0333333(List<Hashtable> list, List<Hashtable> list2, List<Hashtable> excelcolumns, string condition)
        {
            var package = new ExcelPackage();
            package.Workbook.Properties.Title = "Salary Report";
            package.Workbook.Properties.Author = "Vahid N.";
            package.Workbook.Properties.Subject = "Salary Report";
            package.Workbook.Properties.Keywords = "Salary";

            var globalrowindex = 0;
            var hsCondition = new Hashtable();

            Decimal t_amt = 0;
            Decimal s_amt = 0;
            Decimal carry_amt = 0;

            double s_tax = 0;
            double allTotal = 0;
            string strAmt = "";
            string strSettleAmt = "";

            string strCarryAmt = "";

            Decimal rawt_amt = 0;
            Decimal raws_amt = 0;
            string strRawAmt = "";
            string strRawSettleAmt = "";
            /*검색조건 처리부분*/
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }

            // Color colr = System.Drawing.ColorTranslator.FromHtml("#000000");
            var worksheet2 = package.Workbook.Worksheets.Add("정산서");
            var worksheet = package.Workbook.Worksheets.Add("정산내역");
            // hsCondition["excelname"]


            var title = hsCondition["cp_corp_name"].ToString() + " " + hsCondition["st_date"].ToString().Substring(0, 4) + "년 " + hsCondition["st_date"].ToString().Substring(5, 2) + "월 매출 정산서";
            worksheet2.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);


            worksheet2.Cells["B3:F3"].Merge = true;
            worksheet2.Cells[3, 2].Value = title == null ? "" : title;
            //worksheet2.Column(2).Width = 120;
            worksheet2.Cells[3, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[3, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
            // worksheet2.Cells[3, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 18));

            worksheet2.Row(3).Height = 35;
            worksheet2.Row(3).Style.Font.Bold = true;

            using (ExcelRange range = worksheet2.Cells[string.Format("B3:F{0}", '3')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }


            var sender = "■ 발신 :엔케이컨텐츠";
            worksheet2.Cells["B5:F5"].Merge = true;
            worksheet2.Cells[5, 2].Value = sender == null ? "" : sender;
            worksheet2.Row(5).Height = 20;

            var counter = "■ 정산담당자: 구혜림";
            worksheet2.Cells["B6:F6"].Merge = true;
            worksheet2.Cells[6, 2].Value = counter == null ? "" : counter;
            worksheet2.Row(6).Height = 20;

            var rate = "■ 정산요율 ";
            worksheet2.Cells["B7:F7"].Merge = true;
            worksheet2.Cells[7, 2].Value = rate == null ? "" : rate;
            worksheet2.Row(7).Height = 20;

            worksheet2.Cells[8, 3].Value = "VOD,PPV 서비스";
            worksheet2.Cells[8, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            worksheet2.Cells[8, 4].Value = "총매출 기준 45%";
            worksheet2.Cells[8, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 20;

            worksheet2.Cells[9, 3].Value = "방영권료, 기타단매등";
            worksheet2.Cells[9, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(3).Width = 28;

            worksheet2.Cells[9, 4].Value = "판매금액 기준 80%";
            worksheet2.Cells[9, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Column(4).Width = 25;

            using (ExcelRange range = worksheet2.Cells[string.Format("C8:D{0}", '9')])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            var desc = "■ 정산 내역 ";
            worksheet2.Cells["B11:F11"].Merge = true;
            worksheet2.Cells[11, 2].Value = desc == null ? "" : desc;
            worksheet2.Row(11).Height = 20;



            worksheet2.Row(12).Style.Font.Bold = true;


            worksheet2.Cells[12, 2].Value = "NO";
            //worksheet2.Cells[12, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 3].Value = "컨텐츠명";
            //worksheet2.Cells[12, 3].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 3].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[12, 4].Value = "총매출";
            //worksheet2.Cells[12, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 5].Value = "RS";
            // worksheet2.Cells[12, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[12, 6].Value = "정산금액";
            //worksheet2.Cells[12, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[12, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[12, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            if (list2 != null && list2.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 13;

                foreach (Hashtable hs in list2)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();

                        if (data_index != "carryover_amt")
                        {
                            worksheet2.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        }
                        // if(data_index =="carryover_amt"){
                        //     strCarryAmt = hs[data_index].ToString();
                        // }
                        colidx++;
                        Console.WriteLine(data_index);
                    }

                    using (ExcelRange range = worksheet2.Cells[string.Format("B12:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strAmt = worksheet2.Cells[rowidx, 4].Value.ToString();
                    strSettleAmt = worksheet2.Cells[rowidx, 6].Value.ToString();

                    worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                    worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

                    t_amt = t_amt + decimal.Parse(strAmt.Replace(",", ""));
                    s_amt = s_amt + decimal.Parse(strSettleAmt.Replace(",", ""));

                    carry_amt = decimal.Parse(hs["carryover_amt"].ToString());
                    // carry_amt
                    //strCarryAmt = hs["carryover_amt"].ToString();
                    rowidx++;
                }
                //s_tax = (double)s_amt*(double)0.1;
                s_tax = (double)carry_amt - (double)s_amt;
                // allTotal = (double)s_tax+(double)s_amt;
                //s_amt

                worksheet2.Cells[rowidx, 3].Value = "합계";
                worksheet2.Cells[rowidx, 4].Value = t_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 6].Value = s_amt.ToString("#,##0");
                worksheet2.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet2.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet2.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                globalrowindex = rowidx;
            }

            var tax_info = "※선급금 잔액 ";
            worksheet2.Cells["B23:F23"].Merge = true;
            worksheet2.Cells[23, 2].Value = tax_info == null ? "" : tax_info;
            worksheet2.Row(23).Height = 20;

            //  worksheet2.Row(19).Style.Font.Bold = true;


            worksheet2.Cells["B24:C24"].Merge = true;
            worksheet2.Cells["E24:F24"].Merge = true;
            worksheet2.Cells[24, 2].Value = "전월 잔액";
            ///worksheet2.Cells[24, 2].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[24, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[24, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[24, 4].Value = "당월 정산 차감액";
            //worksheet2.Cells[24, 4].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[24, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[24, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            worksheet2.Cells[24, 5].Value = "당월 잔액";
            //worksheet2.Cells[24, 5].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            worksheet2.Cells[24, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[24, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            // worksheet2.Cells[24, 6].Value = "합계";
            // //worksheet2.Cells[24, 6].Style.Font.SetFromFont(new System.Drawing.Font("맑은고딕", 10));
            // worksheet2.Cells[24, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            // worksheet2.Cells[24, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
            worksheet2.Cells["B25:C25"].Merge = true;
            worksheet2.Cells["E25:F25"].Merge = true;

            worksheet2.Cells[25, 2].Value = carry_amt.ToString("#,##0");  // 계산서 발행일 s_amt.ToString("#,##0")
            worksheet2.Cells[25, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[25, 2].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[25, 4].Value = s_amt.ToString("#,##0");  // 공급가액 s_amt.ToString("#,##0")
            worksheet2.Cells[25, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[25, 4].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            worksheet2.Cells[25, 5].Value = s_tax.ToString("#,##0");  // 부가세 s_amt.ToString("#,##0")
            worksheet2.Cells[25, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet2.Cells[25, 5].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;


            // worksheet2.Cells[25, 6].Value = allTotal.ToString("#,##0");  // 합계 s_amt.ToString("#,##0")
            // worksheet2.Cells[25, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            // worksheet2.Cells[25, 6].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

            using (ExcelRange range = worksheet2.Cells[string.Format("B24:F{0}", "25")])
            {
                range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            worksheet2.Cells["B12:F12"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B12:F12"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);

            worksheet2.Cells["B24:F24"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet2.Cells["B24:F24"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.Yellow);




            using (ExcelRange range = worksheet2.Cells[string.Format("G1:G{0}", "30")])
            {
                range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
                //  range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            using (ExcelRange range = worksheet2.Cells[string.Format("A30:G{0}", "30")])
            {
                range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Medium;
            }

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                // worksheet.Range["A1"].font.size = 25;
                // var style = worksheet.Cells[400, 1].Style;
                int idx = 1;
                worksheet.Row(1).Height = 20;
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Font.Size = 10;

                worksheet.Column(1).Width = 8;
                worksheet.Column(2).Width = 50;
                worksheet.Column(3).Width = 30;
                worksheet.Column(4).Width = 12;
                worksheet.Column(5).Width = 8;
                worksheet.Column(6).Width = 12;

                worksheet.Column(1).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(2).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(3).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(4).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Column(5).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Column(6).Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                //
                worksheet.Cells.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.White);

                worksheet.Cells["A1:F1"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells["A1:F1"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                foreach (Hashtable hs in excelcolumns)
                {
                    if (hs["ColumnName"].ToString() != "전월잔액")
                    {
                        worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    }

                    // worksheet.Cells[1, idx].Style.Font.Size = 10;
                    worksheet.Cells[1, idx].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    worksheet.Cells[1, idx].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;

                    idx++;
                }
            }
            //Add values
            var numberformat = "#,##0";
            var dataCellStyleName = "TableNumber";
            var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            numStyle.Style.Numberformat.Format = numberformat;
            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }

                    using (ExcelRange range = worksheet.Cells[string.Format("A1:F{0}", (rowidx + 1).ToString())])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    strRawAmt = worksheet.Cells[rowidx, 4].Value.ToString();
                    strRawSettleAmt = worksheet.Cells[rowidx, 6].Value.ToString();


                    rowidx++;


                    rawt_amt = rawt_amt + decimal.Parse(strRawAmt.Replace(",", ""));
                    raws_amt = raws_amt + decimal.Parse(strRawSettleAmt.Replace(",", ""));
                }

                worksheet.Cells[rowidx, 2].Value = "합계";
                worksheet.Cells[rowidx, 4].Value = rawt_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 6].Value = raws_amt.ToString("#,##0");
                worksheet.Cells[rowidx, 2].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                worksheet.Cells[rowidx, 5].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                worksheet.Cells[rowidx, 6].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

            }


            return package;
        }



        public ExcelPackage createExcelPackage(List<Hashtable> list, List<Hashtable> excelcolumns)
        {
            var package = new ExcelPackage();
            package.Workbook.Properties.Title = "Salary Report";
            package.Workbook.Properties.Author = "Vahid N.";
            package.Workbook.Properties.Subject = "Salary Report";
            package.Workbook.Properties.Keywords = "Salary";


            var worksheet = package.Workbook.Worksheets.Add("RAWDATA111");

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                // worksheet.Range["A1"].font.size = 25;
                int idx = 1;
                foreach (Hashtable hs in excelcolumns)
                {
                    worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    //worksheet.Cells[1, idx].Style.Font.Size = 18;
                    //worksheet.Cells[1, idx].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                    idx++;
                }
            }
            //Add values
            var numberformat = "#,##0";
            var dataCellStyleName = "TableNumber";
            var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            numStyle.Style.Numberformat.Format = numberformat;
            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }
                    rowidx++;
                }

                // Add to table / Add summary row
                //var tbl = worksheet.Tables.Add(new ExcelAddressBase(fromRow: 1, fromCol: 1, toRow: list.Count()+1, toColumn: excelcolumns.Count()), "Data");
                //tbl.ShowHeader = true;
                //tbl.TableStyle = TableStyles.Dark9;
            }
            //worksheet.Cells[1, 1].Value = "ID";
            //worksheet.Cells[1, 2].Value = "Name";
            //worksheet.Cells[1, 3].Value = "Gender";
            //worksheet.Cells[1, 4].Value = "Salary (in $)";

            ////Add values

            //var numberformat = "#,##0";
            //var dataCellStyleName = "TableNumber";
            //var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            //numStyle.Style.Numberformat.Format = numberformat;

            //worksheet.Cells[2, 1].Value = 1000;
            //worksheet.Cells[2, 2].Value = "Jon";
            //worksheet.Cells[2, 3].Value = "M";
            //worksheet.Cells[2, 4].Value = 5000;
            //worksheet.Cells[2, 4].Style.Numberformat.Format = numberformat;

            //worksheet.Cells[3, 1].Value = 1001;
            //worksheet.Cells[3, 2].Value = "Graham";
            //worksheet.Cells[3, 3].Value = "M";
            //worksheet.Cells[3, 4].Value = 10000;
            //worksheet.Cells[3, 4].Style.Numberformat.Format = numberformat;

            //worksheet.Cells[4, 1].Value = 1002;
            //worksheet.Cells[4, 2].Value = "Jenny";
            //worksheet.Cells[4, 3].Value = "F";
            //worksheet.Cells[4, 4].Value = 5000;
            //worksheet.Cells[4, 4].Style.Numberformat.Format = numberformat;

            //// Add to table / Add summary row
            //var tbl = worksheet.Tables.Add(new ExcelAddressBase(fromRow: 1, fromCol: 1, toRow: 4, toColumn: 4), "Data");
            //tbl.ShowHeader = true;
            //tbl.TableStyle = TableStyles.Dark9;
            //tbl.ShowTotal = true;
            //tbl.Columns[3].DataCellStyleName = dataCellStyleName;
            //tbl.Columns[3].TotalsRowFunction = RowFunctions.Sum;
            //worksheet.Cells[5, 4].Style.Numberformat.Format = numberformat;

            //// AutoFitColumns
            //worksheet.Cells[1, 1, 4, 4].AutoFitColumns();

            return package;
        }

        public ExcelPackage createExcelPackage1(IHostingEnvironment _hostingEnvironment, List<Hashtable> list, List<Hashtable> excelcolumns)
        {
            var fileDownloadName = "report.xlsx";
            var reportsFolder = "reports";
            var fileInfo = new FileInfo(Path.Combine(_hostingEnvironment.WebRootPath, reportsFolder, fileDownloadName));

            var package = new ExcelPackage(fileInfo);
            package.Workbook.Properties.Title = "RAWDATA Report";
            package.Workbook.Properties.Author = "miniblog";
            package.Workbook.Properties.Subject = "RAWDATA Report";
            package.Workbook.Properties.Keywords = "RAWDATA";

            var worksheet = package.Workbook.Worksheets.Add("RAWDATA");

            //First add the headers
            if (excelcolumns.Count() > 0)
            {
                int idx = 1;
                foreach (Hashtable hs in excelcolumns)
                {
                    worksheet.Cells[1, idx].Value = hs["ColumnName"].ToString();
                    idx++;
                }
            }
            //Add values
            //var numberformat = "#,##0";
            //var dataCellStyleName = "TableNumber";
            //var numStyle = package.Workbook.Styles.CreateNamedStyle(dataCellStyleName);
            //numStyle.Style.Numberformat.Format = numberformat;

            if (list != null && list.Count() > 0)
            {
                int colidx = 1;
                int rowidx = 2;
                foreach (Hashtable hs in list)
                {
                    colidx = 1;
                    foreach (Hashtable hs1 in excelcolumns)
                    {
                        string data_index = hs1["DataIndex"].ToString();
                        worksheet.Cells[rowidx, colidx].Value = hs[data_index] == null ? "" : hs[data_index].ToString();
                        colidx++;
                    }
                    rowidx++;
                }

                // Add to table / Add summary row
                //var tbl = worksheet.Tables.Add(new ExcelAddressBase(fromRow: 1, fromCol: 1, toRow: list.Count() + 1, toColumn: excelcolumns.Count()), "Data");
                //tbl.ShowHeader = true;
                //tbl.TableStyle = TableStyles.Dark9;
            }
            return package;
        }
    }
}
