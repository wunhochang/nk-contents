using GAPI.Common;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Collections;
using System.Collections.Generic;
using Serilog;

namespace GAPI
{
    public partial class Startup
    {            
        /// <summary>
        /// 모든것이 여기에서 시작되노니
        /// </summary>
        /// <param name="env"></param>
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
                
            Configuration = builder.Build();
            
            // appsettings.json 읽어 놓자.            
            Config.Init(Configuration);
        }

        /// <summary>
        /// App 의 설정
        /// </summary>
        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        /// <summary>
        /// 서비스를 설정한다.
        /// </summary>
        /// <param name="services"></param>
        public void ConfigureServices(IServiceCollection services)
        {
            //CORS 크로스 도메인 이슈(No 'Access-Control-Allow-Origin' header is present on the requested resource) 해결
            services.AddCors();

            // 업로드 폼 길이 제한 수정
            services.Configure<FormOptions>(options => {
                options.ValueCountLimit = 100;
                options.ValueLengthLimit = 1024 * 1024 * 100;
            });


            services.AddMvc();            
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("ConsoleLogging"))
                .AddFile(Configuration.GetSection("FileLogging"))
                .AddDebug();
                
            //loggerFactory.AddConsole(LogLevel.Trace);
            
            Logging.LoggerFactory = loggerFactory;
            
            // Logger 테스트
            Microsoft.Extensions.Logging.ILogger _logger = Logging.CreateLogger<Startup>();

            _logger.LogTrace("Trace Log");
            _logger.LogDebug("Debug Log");
            _logger.LogInformation("Information Log");
            _logger.LogWarning("Warning Log");
            _logger.LogError("Error Log");
            _logger.LogCritical("Critical Log");

            //CORS 크로스 도메인 이슈(No 'Access-Control-Allow-Origin' header is present on the requested resource) 해결
            // Origin, Method 에 따라서 일부만 허가 할 수도 있으나.. 귀차능께로.. 다 풀자
            app.UseCors(builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowCredentials()
                       .AllowAnyHeader();
            });
            
            //JWT(Json Web Token) 를 사용하는 설정
            ConfigureAuth(app);          

            app.UseMvc();

            
            if (env.IsDevelopment())
            {
                Config.IsDevelopment = true;
            }

            _logger.LogInformation("DB Init");
            Config.DBInit();
        }
    }
}
