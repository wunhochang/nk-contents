-- [GetMovieTop10_bak]
select
  data.*
, m.movie_name
from (
select 
  b.movie_no
, sum(b.sales_price) as sales_price
, sum(b.accounting_price) as accounting_price
, sum(b.accounting_cp_price) as accounting_cp_price
from accounting_summary a
left join accounting_rawdata b
on a.accounting_summary_no = b.accounting_summary_no	
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
where a.use_yn = 'Y'
  and a.del_yn = 'N'
  and a.status = 'C'
  and b.accounting_type in ('A','B','D')
  /*and b.sp_cor_accounting_date = :this_date*/
group by b.movie_no  
) data 
left join movie m
on data.movie_no = m.movie_no
order by sales_price desc, accounting_cp_price desc
limit 10;

-- [GetTrendListFirst]
SELECT
sales_kind
 , FN_GET_COMMON_TYPE_DATA('SALES_KIND',sales_kind) sales_kind_name
   {COL_STR}
-- ,SUM(CASE WHEN sales_kind = 'R01' THEN accounting_price END) AS salesamt_1
-- ,SUM(CASE WHEN sales_kind = 'R02' THEN accounting_price END) AS salesamt_2
-- ,SUM(CASE WHEN sales_kind = 'R03' THEN accounting_price END) AS salesamt_3
-- ,SUM(CASE WHEN sales_kind = 'R04' THEN accounting_price END) AS salesamt_4
-- ,SUM(CASE WHEN sales_kind = 'R05' THEN accounting_price END) AS salesamt_5
-- ,SUM(CASE WHEN sales_kind = 'R06' THEN accounting_price END) AS salesamt_6
-- ,SUM(CASE WHEN sales_kind = 'R07' THEN accounting_price END) AS salesamt_7
-- ,SUM(CASE WHEN sales_kind = 'R08' THEN accounting_price END) AS salesamt_8
-- ,SUM(CASE WHEN sales_kind = 'R09' THEN accounting_price END) AS salesamt_9
-- ,SUM(CASE WHEN sales_kind = 'R10' THEN accounting_price END) AS salesamt_10
-- ,SUM(CASE WHEN sales_kind = 'R11' THEN accounting_price END) AS salesamt_11
-- ,SUM(CASE WHEN sales_kind = 'R12' THEN accounting_price END) AS salesamt_12
-- ,SUM(CASE WHEN sales_kind = 'R13' THEN accounting_price END) AS salesamt_13
-- -- ,(CASE WHEN sales_kind = 'R01' THEN FN_GET_COMMON_TYPE_DATA('SALES_KIND','R01') END) AS salesamt_1
, FN_GET_MOVIE_NAME(:movie_no) movie_name
from accounting_summary a
left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 and a.del_yn = 'N'
 and a.status = 'C'
 where b.movie_no=:movie_no
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
  and a.accounting_type in ('A','B','D')
  and LENGTH(sales_kind)>1
  group by   sales_kind
  order by sales_kind asc


-- SELECT
-- left(a.settlement_date,4) settlement_date , 4 cnt
-- ,SUM(CASE WHEN sales_kind = 'R01' THEN accounting_price END) AS salesamt_1
-- ,SUM(CASE WHEN sales_kind = 'R02' THEN accounting_price END) AS salesamt_2
-- ,SUM(CASE WHEN sales_kind = 'R03' THEN accounting_price END) AS salesamt_3
-- ,SUM(CASE WHEN sales_kind = 'R04' THEN accounting_price END) AS salesamt_4
-- ,SUM(CASE WHEN sales_kind = 'R05' THEN accounting_price END) AS salesamt_5
-- ,SUM(CASE WHEN sales_kind = 'R06' THEN accounting_price END) AS salesamt_6
-- ,SUM(CASE WHEN sales_kind = 'R07' THEN accounting_price END) AS salesamt_7
-- ,SUM(CASE WHEN sales_kind = 'R08' THEN accounting_price END) AS salesamt_8
-- ,SUM(CASE WHEN sales_kind = 'R09' THEN accounting_price END) AS salesamt_9
-- ,SUM(CASE WHEN sales_kind = 'R10' THEN accounting_price END) AS salesamt_10
-- ,SUM(CASE WHEN sales_kind = 'R11' THEN accounting_price END) AS salesamt_11
-- ,SUM(CASE WHEN sales_kind = 'R12' THEN accounting_price END) AS salesamt_12
-- ,SUM(CASE WHEN sales_kind = 'R13' THEN accounting_price END) AS salesamt_13
-- -- ,(CASE WHEN sales_kind = 'R01' THEN FN_GET_COMMON_TYPE_DATA('SALES_KIND','R01') END) AS salesamt_1
-- from accounting_summary a
-- left join accounting_rawdata b
-- on a.accounting_summary_no = b.accounting_summary_no	
--   and b.use_yn = 'Y'
--   and b.del_yn = 'N'
--   and b.pre_pay_yn = 'N'
--  where b.movie_no=377
--  and a.settlement_date is not null
--   group by   left(a.settlement_date,4)
-- order by a.settlement_date asc
;


-- [GetTrendListSecond]
select
	  alldata.*
	 , FN_GET_MOVIE_NAME(:movie_no) movie_name
	 , concat(alldata.sales_kind_name1,'[',round(((sub_tot_sum*100)/add_sale_price),2),'%]') sales_kind_name
	 , round(((sub_tot_sum*100)/add_sale_price),2) as percentage
	from (
	  select
	    rdata.*
	  , IFNULL((select sum(b.accounting_price) from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and b.movie_no =:movie_no
		  -- and a.settlement_date < concat(:st_date,'-01')
		and a.status = 'C'
		and a.accounting_type in ('A','B','D')
		),0) as add_sale_price
	      from (  
	      select
		    data.sp_corp_detail_no
		  , data.sales_kind_name1
		  , data.sales_kind
		  , data.depth
		  , SUM(accounting_price) as sub_tot_sum
	      from(
		select
			  a.settlement_date
		  , 0 as sp_corp_detail_no
		  , FN_GET_COMMON_TYPE_DATA('SALES_KIND',b.sales_kind) sales_kind_name1
		  , b.sales_kind
			, sum(b.accounting_price) as accounting_price
		  , 2 as depth
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.status = 'C'
		  and a.accounting_type in ('A','B','D')
		  and b.movie_no =:movie_no
		group by a.settlement_date, b.sales_kind_name, b.sales_kind
	      ) data 
	      group by data.sp_corp_detail_no
		  , data.sales_kind_name1
		  , data.sales_kind
	  ) rdata   
	) alldata
	  order by sales_kind asc
;

-- [GetMovieTop10]
select 
  c.movie_name
, sum(b.sales_price) as sales_price
, sum(b.accounting_price) as accounting_price
, sum(b.accounting_cp_price) as accounting_cp_price
from accounting_summary a
left join accounting_rawdata b
on a.accounting_summary_no = b.accounting_summary_no	
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
left join movie c
on b.movie_no = c.movie_no
where a.use_yn = 'Y'
  and a.del_yn = 'N'
  and a.status = 'C'
  and b.accounting_type in ('A','B','D')
  and a.settlement_date between :st_date  and :end_date
group by c.movie_name
order by accounting_price desc, movie_name asc
limit 10;



-- [GetSpCorpTop10]
select
  data.*
, sp.sp_corp_detail_name
, spc.sp_corp_name
from (
select 
  a.sp_corp_detail_no
, sum(b.sales_price) as sales_price
, sum(b.accounting_price) as accounting_price
, sum(b.accounting_cp_price) as accounting_cp_price
from accounting_summary a
left join accounting_rawdata b
on a.accounting_summary_no = b.accounting_summary_no
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
where a.use_yn = 'Y'
  and a.del_yn = 'N'
  and a.status = 'C'
  and b.accounting_type in ('A','B','D')
  and a.settlement_date between :st_date  and :end_date
group by b.sp_corp_detail_no  
) data 
left join sp_corp_detail sp
on data.sp_corp_detail_no = sp.sp_corp_detail_no
left join sp_corp spc
on sp.sp_corp_no = spc.sp_corp_no
order by accounting_price desc,  spc.sp_corp_name asc, sp.sp_corp_detail_name asc
limit 10;
