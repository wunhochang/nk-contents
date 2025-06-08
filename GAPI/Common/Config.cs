using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GAPI.Common
{
    public static class Config
    {

        //public static DatabaseConfig Database = new DatabaseConfig();

        //public static SQLList SQLList = new SQLList();

        /// <summary>
        /// DB 설정
        /// </summary>
        public static DatabaseConfig Database;

        /// <summary>
        /// 미리 읽어놓은 SQL문 목록
        /// </summary>
        public static SQLList SQLList;

        public static bool IsDevelopment { get; internal set; }

        /// <summary>
        /// DB 설정을 읽어 DB개체를 만들어 돌려준다.
        /// </summary>
        /// <returns></returns>
        internal static IDatabase GetDatabase()
        {
            //throw new NotImplementedException();
            
            //var Type = Configuration.GetSection("Database:Type").Value;
            if(Config.Database.Type.ToUpper() == "MYSQL")
            {
                return new MySQLDB(Config.Database.ConnectString);
            }
            else if (Config.Database.Type.ToUpper() == "MSSQL")
            {
                return new MSSQLDB(Config.Database.ConnectString);
            }
            else
            {
                throw new Exception("Invalid DB information.");
            }
        }
        
        /// <summary>
        /// SQL 파일들의 경로
        /// DB 종류에 따라 달라짐
        /// </summary>
        /// <returns></returns>
        internal static string GetSqlPath()
        {
            return Directory.GetCurrentDirectory() + "/SQL/" + Database.Type.ToString().ToUpper();
        }

        /// <summary>
        /// Upload 파일들의 경로
        /// </summary>
        /// <returns></returns>
        internal static string GetUploadPath()
        {
            return Directory.GetCurrentDirectory() + "/Upload/";
        }

        /// <summary>
        /// 설정을 초기화한다.
        /// DB 관련 설정 읽고 SQL문 읽어들이고
        /// </summary>
        /// <param name="configuration"></param>
        internal static void Init(IConfigurationRoot configuration)
        {
            Database = new DatabaseConfig();

            Config.Database.Type = configuration.GetSection("Database:Type").Value;
            Config.Database.ConnectString = configuration.GetSection("Database:ConnectString").Value;

            //SQLList = new SQLList();
        }

        internal static void DBInit()
        {
            //Database = new DatabaseConfig();

            //Config.Database.Type = configuration.GetSection("Database:Type").Value;
            //Config.Database.ConnectString = configuration.GetSection("Database:ConnectString").Value;
            ILogger _logger = Logging.CreateLogger<SQLList>();

            _logger.LogInformation("new SQLList");
            SQLList = new SQLList();
        }
    }
}