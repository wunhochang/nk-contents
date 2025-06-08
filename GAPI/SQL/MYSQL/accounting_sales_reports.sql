-- [GetMovieSalesReport_bak]
CALL get_movie_sale_report_list(
	  :st_year
	, :movie_no
);

-- [GetMovieSalesReport]
  select
    alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
  from (
    	select
      	  rdata.*
      	, m.movie_name
      	, m.service_open_date
        , IFNULL((select sum(a.total_accounting_price) from accounting_summary a 
          	left join accounting_rawdata b
          	on a.accounting_summary_no = b.accounting_summary_no
          	  and b.use_yn = 'Y'
          	  and b.del_yn = 'N'
          	where a.use_yn = 'Y'
          	  and a.del_yn = 'N'
          	  and a.settlement_date < date_format((:st_date-1),'-01')
              and a.status = 'C'
              and b.movie_no = rdata.movie_no),0) as add_sale_price
      	from 
      	(
        	select
        	  data.movie_no
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-01'), total_accounting_price, 0)) AS col_1
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-02'), total_accounting_price, 0)) AS col_2
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-03'), total_accounting_price, 0)) AS col_3
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-04'), total_accounting_price, 0)) AS col_4
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-05'), total_accounting_price, 0)) AS col_5
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-06'), total_accounting_price, 0)) AS col_6
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-07'), total_accounting_price, 0)) AS col_7
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-08'), total_accounting_price, 0)) AS col_8
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-09'), total_accounting_price, 0)) AS col_9
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-10'), total_accounting_price, 0)) AS col_10
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-11'), total_accounting_price, 0)) AS col_11
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-12'), total_accounting_price, 0)) AS col_12
        	, SUM(total_accounting_price) as sub_tot_sum
        	from(
        	select
        	  b.movie_no
        	, a.settlement_date
        	, sum(a.total_accounting_price) as total_accounting_price
        	from accounting_summary a 
        	left join accounting_rawdata b
        	on a.accounting_summary_no = b.accounting_summary_no
          	and b.use_yn = 'Y'
          	and b.del_yn = 'N'
        	where a.use_yn = 'Y'
        	  and a.del_yn = 'N'
            and a.status = 'C'
        	  and a.settlement_date between '2017-01' and '2017-08'
        	group by b.movie_no, a.settlement_date   
      	) data
      	group by data.movie_no
    	) rdata left join movie m on rdata.movie_no = m.movie_no
  ) alldata;

-- [GetYearList]
select 
  c_year 
from calendar
where c_year between '2013' and date_format(now(),'%Y')
group by c_year
order by c_year desc;
