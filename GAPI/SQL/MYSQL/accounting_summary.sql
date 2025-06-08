-- [GetList]
select
	data.*,
	fn_get_common_type_data('SETTLEMENT_PROCESS_TYPE', data.status) as status_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_common_type_data('ACCOUNTING_TYPE', data.accounting_type) as accounting_type_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name,
	fn_get_user_name_by_no(data.confirm_user_no) as confirm_user_no_name
from (
select 
	  a.accounting_summary_no
	, a.sp_corp_detail_no
	, a.settlement_title
	, a.sales_date
	, a.settlement_date
	, a.status
	, a.total_sales_price
	, a.accounting_rates
	, a.total_accounting_price
	, a.total_accounting_cp_price
	, a.use_yn
	, a.accounting_type
	, a.insert_user_no
	, a.insert_date
	, a.update_user_no
	, a.update_date
	, a.confirm_user_no
	, a.confirm_date
	, b.sp_corp_detail_name
	, c.sp_corp_name
	, (select count(*) 
		from accounting_summary a 
		left join sp_corp_detail b 
		on a.sp_corp_detail_no = b.sp_corp_detail_no
		left join sp_corp c
		on b.sp_corp_detail_no = c.sp_corp_no
	where 1=1 
		and a.del_yn='N' 
		and a.use_yn='Y' 
		{IN_STR}) as total_count
from accounting_summary a 
left join sp_corp_detail b 
on a.sp_corp_detail_no = b.sp_corp_detail_no
left join sp_corp c
on b.sp_corp_no = c.sp_corp_no
where 1=1 
	and a.del_yn = 'N'
	and a.use_yn = 'Y'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;
 
-- [Insert]
insert into accounting_summary(
	  accounting_summary_no
	, sp_corp_detail_no
	, settlement_title
	, sales_date
	, settlement_date
	, status
	, total_sales_price
	, accounting_rates
	, total_accounting_price
	, total_accounting_cp_price
	, accounting_type
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :accounting_summary_no
	, :sp_corp_detail_no
	, :settlement_title
	, :sales_date
	, :settlement_date
	, :status
	, :total_sales_price
	, :accounting_rates
	, :total_accounting_price
	, :total_accounting_cp_price
	, :accounting_type
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update accounting_summary set
	  sp_corp_detail_no			= :sp_corp_detail_no           
	, settlement_title			= :settlement_title            
	, sales_date				= :sales_date                  
	, settlement_date			= :settlement_date             
	, status					= :status                      
	, total_sales_price			= :total_sales_price           
	, accounting_rates			= :accounting_rates            
	, total_accounting_price		= :total_accounting_price      
	, total_accounting_cp_price		= :total_accounting_cp_price   
	, accounting_type			= :accounting_type
	, update_user_no			= :oper_user_no     
	, update_date				= current_timestamp 
	, confirm_date  = (case when :status = 'C' then current_timestamp else null end)
	, confirm_user_no  = (case when :status = 'C' then :oper_user_no   else null end)
where accounting_summary_no = :accounting_summary_no
;

-- [Delete]
update accounting_summary set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where accounting_summary_no = :accounting_summary_no
;

-- [GetMovieSalesReport]
select 
*
from (
  select
      alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 1 as depth
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
              	  and a.settlement_date < concat(:st_date,'-01')
                  and a.status = 'C'
            	    and a.accounting_type in ('A','B','D')
					{IN_STR}
                  and b.movie_no = rdata.movie_no
      	   ),0) as add_sale_price
    from (       
      select
          	  data.movie_no
          	, data.movie_name
            , data.service_open_date
			, data.publication_code
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
          	, SUM(accounting_price) as sub_tot_sum
      from (
          select
           a.movie_no, a.movie_name, a.service_open_date, a.publication_code, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
          from movie a
          left join (
          	select
          		  b.movie_no
          		, a.settlement_date
          		, sum(b.accounting_price) as accounting_price
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
          			and b.use_yn = 'Y'
          			and b.del_yn = 'N'
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
          	    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
				{IN_STR}
          	  group by b.movie_no, a.settlement_date
          ) b
          on a.movie_no = b.movie_no
          where a.use_yn = 'Y'
            and a.del_yn = 'N'
			{IN_STR1}
      ) data
      group by data.movie_no
          	, data.movie_name
            , data.service_open_date
			, data.publication_code
    ) rdata
  ) alldata
  union all
  select
      0 as movie_no, '합계' as movie_name, ' ' as serice_open_date, '' as publication_code
    , alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 2 as depth
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
              	  and a.settlement_date < concat(:st_date,'-01')
                  and a.status = 'C'
            	    and a.accounting_type in ('A','B','D')
					{IN_STR}
      	   ),0) as add_sale_price
    from (       
      select
          	  SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
          	, SUM(accounting_price) as sub_tot_sum
      from (
          select
           a.movie_no, a.movie_name, a.service_open_date, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
          from movie a
          left join (
          	select
          		  b.movie_no
          		, a.settlement_date
          		, sum(b.accounting_price) as accounting_price
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
          			and b.use_yn = 'Y'
          			and b.del_yn = 'N'
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
          	    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
				{IN_STR}
          	  group by b.movie_no, a.settlement_date
          ) b
          on a.movie_no = b.movie_no
          where a.use_yn = 'Y'
            and a.del_yn = 'N'
			{IN_STR1}
      ) data
    ) rdata
  ) alldata
) talldata
order by depth asc, service_open_date desc, movie_name asc
;


-- [GetMovieSalesReport_bak]
CALL get_movie_sale_report_list(
	  :st_year
	, :movie_no
);

-- [GetMovieSalesReport_bak20170825]
  select
    alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
  from (
    	select
      	  rdata.*
      	, m.movie_name
      	, m.service_open_date
        , IFNULL((select sum(b.accounting_price) from accounting_summary a 
          	left join accounting_rawdata b
          	on a.accounting_summary_no = b.accounting_summary_no
          	  and b.use_yn = 'Y'
          	  and b.del_yn = 'N'
          	where a.use_yn = 'Y'
          	  and a.del_yn = 'N'
          	  and a.settlement_date < concat(:st_date,'-01')
              and a.status = 'C'
			  and a.accounting_type in ('A','B','D')
              and b.movie_no = rdata.movie_no
			  {IN_STR} ),0) as add_sale_price
      	from 
      	(
        	select
        	  data.movie_no
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        	, SUM(accounting_price) as sub_tot_sum
        	from(
        	select
        	  b.movie_no
        	, a.settlement_date
        	, sum(b.accounting_price) as accounting_price
        	from accounting_summary a 
        	left join accounting_rawdata b
        	on a.accounting_summary_no = b.accounting_summary_no
          		and b.use_yn = 'Y'
          		and b.del_yn = 'N'
        	where a.use_yn = 'Y'
        	  and a.del_yn = 'N'
			  and a.status = 'C'
			  and a.accounting_type in ('A','B','D')
        	  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
		  {IN_STR} 
        	group by b.movie_no, a.settlement_date   
      	) data
      	group by data.movie_no
    	) rdata left join movie m on rdata.movie_no = m.movie_no
  ) alldata
  ;


-- [GetInterSalesReport]
select
*
from (
	select
	    alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , 1 as depth
	from (
	  select
		  rdata.*
	    , IFNULL((
		select 
		  sum(b.accounting_price) 
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < :st_date1 -- concat(:st_date,'-01')
		  and a.status = 'C'
		      and a.accounting_type in ('A','B','D')
		  and b.movie_no = rdata.movie_no
		  and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		  {IN_STR} 
		  ),0) as add_sale_price
	  from(    
	    select
		  data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.movie_no
		, data.movie_name
		, data.publication_code
		{COL_STR} 
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		-- , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		, SUM(IFNULL(accounting_price,0)) as sub_tot_sum
	    from(
		select
		    aa.sp_corp_detail_no
		  , aa.movie_no
		  , bb.settlement_date
		  , bb.accounting_price
		  , cc.sp_corp_detail_name 
		  , dd.movie_name
		  , (select max(sales_kind_name) from sp_corp_detail where sp_corp_detail_no = aa.sp_corp_detail_no) publication_code
		from vw_tot_corp_sales_movie aa
		left join (
		  select
			  b.movie_no
			, a.settlement_date
		    , a.sp_corp_detail_no
			, sum(b.accounting_price) as accounting_price
			, b.sales_kind_name
		  from accounting_summary a 
		  left join accounting_rawdata b
		  on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		  where a.use_yn = 'Y'
		    and a.del_yn = 'N'
		    and a.status = 'C'
		    and a.accounting_type in ('A','B','D')
		    and a.settlement_date between :st_date1 and :dt_date1 -- concat(:st_date,'-01') and concat(:st_date,'-12')
			{IN_STR} 
		  group by b.movie_no, a.settlement_date, a.sp_corp_detail_no
		) bb
		on aa.movie_no = bb.movie_no
		  and aa.sp_corp_detail_no = bb.sp_corp_detail_no
		left join sp_corp_detail cc
		on aa.sp_corp_detail_no = cc.sp_corp_detail_no
		left join movie dd
		on aa.movie_no = dd.movie_no
			where 1=1  and aa.movie_no is not null
			{IN_STR1} 
	    ) data
	    group by data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.movie_no
		, data.movie_name
		, data.publication_code
	  ) rdata
	) alldata  
	union all
	select
	    alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , 2 as depth
	from (
	select
		  rdata.*
	  , IFNULL((
	      select 
		sum(b.accounting_price) 
	      from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < :st_date1 -- concat(:st_date,'-01')
		and a.status = 'C'
		      and a.accounting_type in ('A','B','D')
		-- and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		{IN_STR} 
		  ),0) as add_sale_price
	from(
	  select
		  data.sp_corp_detail_no
	      , ' ' sp_corp_detail_name
	      , 0 as movie_no
	      , '합계' as movie_name
		  , '' as publication_code
		  {COL_STR} 
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
	    --   , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
	      , SUM(IFNULL(accounting_price,0)) as sub_tot_sum
	  from(
		select
		    9999999999 sp_corp_detail_no
		  , bb.settlement_date
		  , bb.accounting_price
		  , '' sp_corp_detail_name 
		from vw_tot_corp_sales_movie aa
		left join (
		  select
			  b.movie_no movie_no
			, a.settlement_date
		    , a.sp_corp_detail_no
			, sum(b.accounting_price) as accounting_price
		  from accounting_summary a 
		  left join accounting_rawdata b
		  on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		  where a.use_yn = 'Y'
		    and a.del_yn = 'N'
		    and a.status = 'C'
		    and a.accounting_type in ('A','B','D')
		    and a.settlement_date between :st_date1 and :dt_date1 --  concat(:st_date,'-01') and concat(:st_date,'-12')
			{IN_STR} 
		  group by b.movie_no, a.settlement_date -- , a.sp_corp_detail_no
		) bb
		on aa.movie_no = bb.movie_no
		and aa.sp_corp_detail_no = bb.sp_corp_detail_no
		  /* and aa.sp_corp_detail_no = bb.sp_corp_detail_no
		left join sp_corp_detail cc
		on aa.sp_corp_detail_no = cc.sp_corp_detail_no */
		where 1=1
		{IN_STR1} 
	  ) data
	  -- group by data.sp_corp_detail_no
		--  , data.sp_corp_detail_name
	) rdata    
	) alldata 
) tdata
order by depth asc, movie_name asc, publication_code asc
;

-- [GetTotalSalesReport]
SELECT aa.sp_corp_detail_no,
       aa.movie_no,
       cc.sp_corp_detail_name,
       dd.movie_name,
       dd.service_open_date, 
       dd.publication_code,
       1 AS depth,
       ifnull(bb.prev_accumulate, 0) add_sale_price,
       ifnull(bb.col_1, 0) col_1,
       ifnull(bb.col_2, 0) col_2,
       ifnull(bb.col_3, 0) col_3,
       ifnull(bb.col_4, 0) col_4,
       ifnull(bb.col_5, 0) col_5,
       ifnull(bb.col_6, 0) col_6,
       ifnull(bb.col_7, 0) col_7,
       ifnull(bb.col_8, 0) col_8,
       ifnull(bb.col_9, 0) col_9,
       ifnull(bb.col_10, 0) col_10,
       ifnull(bb.col_11, 0) col_11,
       ifnull(bb.col_12, 0) col_12,
       ifnull(bb.sub_tot_sum, 0) sub_tot_sum,
       ifnull(bb.current_accumulate, 0) total_sum
FROM vw_tot_corp_sales_movie aa
     LEFT OUTER JOIN accounting_summary_year bb
        ON     aa.movie_no = bb.movie_no
           AND aa.sp_corp_detail_no = bb.sp_corp_detail_no
     LEFT JOIN sp_corp_detail cc
        ON aa.sp_corp_detail_no = cc.sp_corp_detail_no
     LEFT JOIN movie dd ON aa.movie_no = dd.movie_no
WHERE bb.year = :st_date 
      {IN_STR}  -- and bb.movie_no=178
	  {IN_STR1}
union all 
SELECT null sp_corp_detail_no,
       null movie_no,
       null sp_corp_detail_name,
       '합계' movie_name,
       null service_open_date,
       null publication_code,
       2 AS depth,
       sum(ifnull(bb.prev_accumulate, 0)) add_sale_price,
       sum(ifnull(bb.col_1, 0)) col_1,
       sum(ifnull(bb.col_2, 0)) col_2,
       sum(ifnull(bb.col_3, 0)) col_3,
       sum(ifnull(bb.col_4, 0)) col_4,
       sum(ifnull(bb.col_5, 0)) col_5,
       sum(ifnull(bb.col_6, 0)) col_6,
       sum(ifnull(bb.col_7, 0)) col_7,
       sum(ifnull(bb.col_8, 0)) col_8,
       sum(ifnull(bb.col_9, 0)) col_9,
       sum(ifnull(bb.col_10, 0)) col_10,
       sum(ifnull(bb.col_11, 0)) col_11,
       sum(ifnull(bb.col_12, 0)) col_12,
       sum(ifnull(bb.sub_tot_sum, 0)) sub_tot_sum,
       sum(ifnull(bb.current_accumulate, 0)) total_sum
FROM vw_tot_corp_sales_movie aa
     LEFT OUTER JOIN accounting_summary_year bb
        ON     aa.movie_no = bb.movie_no
           AND aa.sp_corp_detail_no = bb.sp_corp_detail_no
     LEFT JOIN sp_corp_detail cc
        ON aa.sp_corp_detail_no = cc.sp_corp_detail_no
     LEFT JOIN movie dd ON aa.movie_no = dd.movie_no
WHERE bb.year = :st_date 
		{IN_STR}   -- and bb.movie_no=178
		{IN_STR1}
-- GROUP BY aa.sp_corp_detail_no,
--          cc.sp_corp_detail_name         
ORDER BY depth ASC, movie_name ASC         
;

-- [GetTotalSalesReport_bak20240125]
select
*
from (
	select
	    alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , 1 as depth
	from (
	  select
		  rdata.*
	    , IFNULL((
		select 
		  sum(b.accounting_price) 
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < concat(:st_date,'-01')
		  and a.status = 'C'
		      and a.accounting_type in ('A','B','D')
		  and b.movie_no = rdata.movie_no
		  and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		  {IN_STR} 
		  ),0) as add_sale_price
	  from(    
	    select
		  data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.movie_no
		, data.movie_name
		, data.service_open_date
		, data.publication_code
		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		, SUM(IFNULL(accounting_price,0)) as sub_tot_sum
	    from(
		select
		    aa.sp_corp_detail_no
		  , aa.movie_no
		  , bb.settlement_date
		  , bb.accounting_price
		  , cc.sp_corp_detail_name 
		  , dd.movie_name
		  , dd.service_open_date
		  , (select max(sales_kind_name) from sp_corp_detail where sp_corp_detail_no = aa.sp_corp_detail_no) publication_code
		from vw_tot_corp_sales_movie aa
		left join (
		  select
			  b.movie_no
			, a.settlement_date
		    , a.sp_corp_detail_no
			, sum(b.accounting_price) as accounting_price
			, b.sales_kind_name
		  from accounting_summary a 
		  left join accounting_rawdata b
		  on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		  where a.use_yn = 'Y'
		    and a.del_yn = 'N'
		    and a.status = 'C'
		    and a.accounting_type in ('A','B','D')
		    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
			{IN_STR} 
		  group by b.movie_no, a.settlement_date, a.sp_corp_detail_no
		) bb
		on aa.movie_no = bb.movie_no
		  and aa.sp_corp_detail_no = bb.sp_corp_detail_no
		left join sp_corp_detail cc
		on aa.sp_corp_detail_no = cc.sp_corp_detail_no
		left join movie dd
		on aa.movie_no = dd.movie_no
			where 1=1  and dd.movie_no is not null
			{IN_STR1} 
	    ) data
	    group by data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.movie_no
		, data.movie_name
		, data.publication_code
	  ) rdata
	) alldata  
	union all
	select
	    alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , 2 as depth
	from (
	select
		  rdata.*
	  , IFNULL((
	      select 
		sum(b.accounting_price) 
	      from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < concat(:st_date,'-01')
		and a.status = 'C'
		      and a.accounting_type in ('A','B','D')
		-- and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		{IN_STR} 
		  ),0) as add_sale_price
	from(
	  select
		  data.sp_corp_detail_no
	      , ' ' sp_corp_detail_name
	      , 0 as movie_no
	      , '합계' as movie_name
		  , '' as service_open_date
		  , '' as publication_code
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
	      , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
	      , SUM(IFNULL(accounting_price,0)) as sub_tot_sum
	  from(
		select
		    9999999999 sp_corp_detail_no
		  , bb.settlement_date
		  , bb.accounting_price
		  , '' sp_corp_detail_name 
		from vw_tot_corp_sales_movie2 aa
		left join (
		  select
			  max(b.movie_no) movie_no
			, a.settlement_date
		    , 9999999999 sp_corp_detail_no
			, sum(b.accounting_price) as accounting_price
		  from accounting_summary a 
		  left join accounting_rawdata b
		  on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		  where a.use_yn = 'Y'
		    and a.del_yn = 'N'
		    and a.status = 'C'
		    and a.accounting_type in ('A','B','D')
		    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
			{IN_STR} 
		  group by b.movie_no, a.settlement_date -- , a.sp_corp_detail_no
		) bb
		on aa.movie_no = bb.movie_no
		and bb.settlement_date = aa.settlement_date
		  /* and aa.sp_corp_detail_no = bb.sp_corp_detail_no
		left join sp_corp_detail cc
		on aa.sp_corp_detail_no = cc.sp_corp_detail_no */
		where 1=1
		{IN_STR1} 
	  ) data
	  --group by data.sp_corp_detail_no
		--  , data.sp_corp_detail_name
	) rdata    
	) alldata 
) tdata
order by depth asc, movie_name asc, sp_corp_detail_no asc
;

-- [GetTotalSalesReport_bak20170824]
select
    alldata.*
  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
  , 1 as depth
from (
  select
  	  rdata.*
    , IFNULL((
        select 
          sum(b.accounting_price) 
        from accounting_summary a 
      	left join accounting_rawdata b
      	on a.accounting_summary_no = b.accounting_summary_no
      	  and b.use_yn = 'Y'
      	  and b.del_yn = 'N'
      	where a.use_yn = 'Y'
      	  and a.del_yn = 'N'
      	  and a.settlement_date < concat(:st_date,'-01')
          and a.status = 'C'
  	      and a.accounting_type in ('A','B','D')
          and b.movie_no = rdata.movie_no
          and b.sp_corp_detail_no = rdata.sp_corp_detail_no
          {IN_STR} 
  	  ),0) as add_sale_price
  from(    
    select
          data.sp_corp_detail_no
        , data.sp_corp_detail_name
        , data.movie_no
        , data.movie_name
        , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        , SUM(IFNULL(accounting_price,0)) as sub_tot_sum
    from(
        select
            aa.sp_corp_detail_no
          , aa.movie_no
          , bb.settlement_date
          , bb.accounting_price
          , cc.sp_corp_detail_name 
          , dd.movie_name
        from vw_tot_corp_sales_movie aa
        left join (
          select
          	  b.movie_no
          	, a.settlement_date
            , a.sp_corp_detail_no
          	, sum(b.accounting_price) as accounting_price
          from accounting_summary a 
          left join accounting_rawdata b
          on a.accounting_summary_no = b.accounting_summary_no
          		and b.use_yn = 'Y'
          		and b.del_yn = 'N'
          where a.use_yn = 'Y'
            and a.del_yn = 'N'
            and a.status = 'C'
            and a.accounting_type in ('A','B','D')
            and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
            {IN_STR} 
          group by b.movie_no, a.settlement_date, a.sp_corp_detail_no
        ) bb
        on aa.movie_no = bb.movie_no
          and aa.sp_corp_detail_no = bb.sp_corp_detail_no
        left join sp_corp_detail cc
        on aa.sp_corp_detail_no = cc.sp_corp_detail_no
        left join movie dd
        on aa.movie_no = dd.movie_no
		where 1=1
		{IN_STR1}
    ) data
    group by data.sp_corp_detail_no
        , data.sp_corp_detail_name
        , data.movie_no
        , data.movie_name
  ) rdata
) alldata  
order by sp_corp_detail_no asc, depth asc, movie_name asc
; 
 
-- [GetTotalSalesReport_bak]
  select
    alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
  from (
    select
    	  rdata.*
    	, m.movie_name
    	, m.service_open_date
      , scd.sp_corp_detail_name
      , IFNULL((select sum(b.accounting_price) from accounting_summary a 
        	left join accounting_rawdata b
        	on a.accounting_summary_no = b.accounting_summary_no
        	  and b.use_yn = 'Y'
        	  and b.del_yn = 'N'
        	where a.use_yn = 'Y'
        	  and a.del_yn = 'N'
        	  and a.settlement_date < concat(:st_date,'-01')
            and a.status = 'C'
			and a.accounting_type in ('A','B','D')
            and b.movie_no = rdata.movie_no
            and b.sp_corp_detail_no = rdata.sp_corp_detail_no
			{IN_STR} ),0) as add_sale_price
    from (              
        select
              data.movie_no
            , data.sp_corp_detail_no
            , MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
            , MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
            , MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
            , MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
            , MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
            , MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
            , MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
            , MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
            , MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
            , MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
            , MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
            , MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
            , SUM(accounting_price) as sub_tot_sum
        from(
            select
            	  b.movie_no
            	, a.settlement_date
              , a.sp_corp_detail_no
            	, sum(b.accounting_price) as accounting_price
            from accounting_summary a 
            left join accounting_rawdata b
            on a.accounting_summary_no = b.accounting_summary_no
            		and b.use_yn = 'Y'
            		and b.del_yn = 'N'
            where a.use_yn = 'Y'
              and a.del_yn = 'N'
              and a.status = 'C'
              and a.accounting_type in ('A','B','D')
              and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
		  {IN_STR} 
            group by b.movie_no, a.settlement_date, a.sp_corp_detail_no
        ) data
        group by data.movie_no, data.sp_corp_detail_no
    ) rdata 
    left join movie m on rdata.movie_no = m.movie_no 
    left join sp_corp_detail scd on rdata.sp_corp_detail_no = scd.sp_corp_detail_no
) alldata    
order by alldata.sp_corp_detail_name asc;

--[GetCorpSalesReport]
select
      alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 1 as depth
    from (  
      select
         rdata.*
       , IFNULL(sale_data.accounting_price, 0) AS add_sale_price
      from (         
        select
         data.sp_corp_detail_no
       , data.sp_corp_detail_name
       , data.sales_kind_name
	   , data.sales_kind_name1
       , data.sales_kind
       , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
       , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
       , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
       , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
       , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
       , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
       , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
       , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
       , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
       , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
       , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
       , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
       , SUM(accounting_price) as sub_tot_sum
        from (
          select
             data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.type_data as sales_kind_name1, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
             select 
               a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
             from sales_kind a
             left join common_code b
             on a.sales_kind = b.type_code
             left join sp_corp_detail c
             on a.sp_corp_detail_no = c.sp_corp_detail_no
         left join sp_corp d
         on c.sp_corp_no = d.sp_corp_no
             where a.sales_kind is not null
               and b.type_name= 'SALES_KIND'
            and c.use_yn='Y' 
            and c.del_yn = 'N'
            and d.use_yn = 'Y'
            and d.del_yn = 'N'
           {IN_STR1}
          ) data1
          left join (
             select
                  b.movie_no
                , a.settlement_date
                , a.sp_corp_detail_no
                , sum(b.accounting_price) as accounting_price
                , b.sales_kind
               from accounting_summary a 
               left join accounting_rawdata b
               on a.accounting_summary_no = b.accounting_summary_no
                   and b.use_yn = 'Y'
                   and b.del_yn = 'N'
               where a.use_yn = 'Y'
                 and a.del_yn = 'N'
                 and a.status = 'C'
                 and a.accounting_type in ('A','B','D')
                 and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
          {IN_STR}
               group by b.movie_no, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
             and data1.sales_kind = data2.sales_kind
        ) data
        group by data.sp_corp_detail_no
              , data.sales_kind_name
              , data.sales_kind
              , data.sp_corp_detail_name) rdata
    LEFT OUTER JOIN
               (SELECT b.sales_kind,
                       b.sp_corp_detail_no,
                       sum(b.accounting_price) accounting_price
                  FROM accounting_summary a
                       LEFT JOIN accounting_rawdata b
                          ON     a.accounting_summary_no =
                                    b.accounting_summary_no
                             AND b.use_yn = 'Y'
                             AND b.del_yn = 'N'
                 WHERE     a.use_yn = 'Y'
                       AND a.del_yn = 'N'
                       AND a.settlement_date < concat(:st_date, '-01')
                       AND a.status = 'C'
                       AND a.accounting_type IN ('A', 'B', 'D')
                       {IN_STR}
                -- AND b.movie_no = rdata.movie_no
                -- AND b.sp_corp_detail_no = rdata.sp_corp_detail_no
                GROUP BY b.sales_kind, b.sp_corp_detail_no) AS sale_data
                  ON  sale_data.sp_corp_detail_no = rdata.sp_corp_detail_no
       AND sale_data.sales_kind = rdata.sales_kind) alldata
                 where 1=1
    union all
    select
        0 as sp_corp_detail_no
      , '' sp_corp_detail_name
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 2 as depth
    from (  
      select
              rdata.*
            , IFNULL(pre_sale_data.add_sale_price, 0) AS add_sale_price
      from (         
        select
               concat(data.sales_kind_name, ' 소계') as sales_kind_name
			  , data.sales_kind_name   as sales_kind_name1
              , data.sales_kind
              , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
              , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
              , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
              , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
              , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
              , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
              , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
              , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
              , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
              , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
              , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
              , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
              , SUM(accounting_price) as sub_tot_sum
        from (
          select
             data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name,data1.type_data as sales_kind_name1, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
             select 
               a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
             from sales_kind a
             left join common_code b
             on a.sales_kind = b.type_code
             left join sp_corp_detail c
             on a.sp_corp_detail_no = c.sp_corp_detail_no
         left join sp_corp d
         on c.sp_corp_no = d.sp_corp_no
             where a.sales_kind is not null
               and b.type_name= 'SALES_KIND'
            and c.use_yn='Y' 
            and c.del_yn = 'N'
            and d.use_yn = 'Y'
            and d.del_yn = 'N'
           {IN_STR1}
          ) data1
          left join (
             select
                  b.movie_no
                , a.settlement_date
                , a.sp_corp_detail_no
                , sum(b.accounting_price) as accounting_price
                , b.sales_kind
               from accounting_summary a 
               left join accounting_rawdata b
               on a.accounting_summary_no = b.accounting_summary_no
                   and b.use_yn = 'Y'
                   and b.del_yn = 'N'
               where a.use_yn = 'Y'
                 and a.del_yn = 'N'
                 and a.status = 'C'
                 and a.accounting_type in ('A','B','D')
                 and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
          {IN_STR}
               group by b.movie_no, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
             and data1.sales_kind = data2.sales_kind
        ) data
        group by data.sales_kind_name
              , data.sales_kind
      ) rdata
    LEFT OUTER JOIN
               (SELECT b.sales_kind,
                       sum(b.accounting_price) add_sale_price
                  FROM accounting_summary a
                       LEFT JOIN accounting_rawdata b
                          ON     a.accounting_summary_no =
                                    b.accounting_summary_no
                             AND b.use_yn = 'Y'
                             AND b.del_yn = 'N'
                 WHERE     a.use_yn = 'Y'
                       AND a.del_yn = 'N'
                       AND a.settlement_date < concat(:st_date, '-01')
                       AND a.status = 'C'
                       AND a.accounting_type IN ('A', 'B', 'D')
                        {IN_STR}
                GROUP BY b.sales_kind) pre_sale_data
                  ON rdata.sales_kind = pre_sale_data.sales_kind) alldata
union all
    select
        0 as sp_corp_detail_no
      , '' sp_corp_detail_name
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 9 as depth
    from (  
      select
              rdata.*
            , IFNULL(pre_sale_data.add_sale_price, 0) AS add_sale_price
      from (         
        select
                ' 합계' as sales_kind_name
              ,'흐황황황황황황황' as sales_kind_name1
              , '' sales_kind
              , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
              , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
              , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
              , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
              , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
              , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
              , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
              , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
              , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
              , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
              , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
              , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
              , SUM(accounting_price) as sub_tot_sum
        from (
             select
                  b.movie_no
                , a.settlement_date
                , a.sp_corp_detail_no
                , sum(b.accounting_price) as accounting_price
                , '' sales_kind
               from accounting_summary a 
               left join accounting_rawdata b
               on a.accounting_summary_no = b.accounting_summary_no
                   and b.use_yn = 'Y'
                   and b.del_yn = 'N'
               left join common_code c
               on c.type_code = b.sales_kind
               where a.use_yn = 'Y'
                 and a.del_yn = 'N'
                 and c.type_name='SALES_KIND'
                 and a.status = 'C'
                 and a.accounting_type in ('A','B','D')
				 and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
			     {IN_STR}
				 {IN_STR2}
               group by  a.settlement_date, a.sp_corp_detail_no
        ) data 
      ) rdata
    LEFT OUTER JOIN
               (SELECT '' sales_kind
                       ,sum(b.accounting_price) add_sale_price
                  FROM accounting_summary a
                       LEFT JOIN accounting_rawdata b
                          ON     a.accounting_summary_no =
                                    b.accounting_summary_no
                             AND b.use_yn = 'Y'
                             AND b.del_yn = 'N'
                 WHERE     a.use_yn = 'Y'
                       AND a.del_yn = 'N'
                       AND a.settlement_date < concat(:st_date, '-01')
                       AND a.status = 'C'
                       AND a.accounting_type IN ('A', 'B', 'D')
					   {IN_STR}
					   {IN_STR2}
                ) pre_sale_data
                  ON rdata.sales_kind = pre_sale_data.sales_kind) alldata

    -- select
    --     0 as sp_corp_detail_no
    --   , '' sp_corp_detail_name
    --   , alldata.*
    --   , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    --   , 9 as depth
    -- from (  
    --   select
    --           rdata.*
    --         , IFNULL(pre_sale_data.add_sale_price, 0) AS add_sale_price
    --   from (         
    --     select
    --             ' 합계' as sales_kind_name
    --           ,'흐황황황황황황황' as sales_kind_name1
    --           , data.sales_kind
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
    --           , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
    --           , SUM(accounting_price) as sub_tot_sum
    --     from (
    --       select
    --          data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.type_data as sales_kind_name1, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
    --       from (
    --          select 
    --            a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
    --          from sales_kind a
    --          left join common_code b
    --          on a.sales_kind = b.type_code
    --          left join sp_corp_detail c
    --          on a.sp_corp_detail_no = c.sp_corp_detail_no
    --      left join sp_corp d
    --      on c.sp_corp_no = d.sp_corp_no
    --          where a.sales_kind is not null
    --            and b.type_name= 'SALES_KIND'
    --         and c.use_yn='Y' 
    --         and c.del_yn = 'N'
    --         and d.use_yn = 'Y'
    --         and d.del_yn = 'N'
	-- 		{IN_STR1}
	-- 		{IN_STR}
    --       ) data1
    --       left join (
    --          select
    --               b.movie_no
    --             , a.settlement_date
    --             , a.sp_corp_detail_no
    --             , sum(b.accounting_price) as accounting_price
    --             , b.sales_kind
    --            from accounting_summary a 
    --            left join accounting_rawdata b
    --            on a.accounting_summary_no = b.accounting_summary_no
    --                and b.use_yn = 'Y'
    --                and b.del_yn = 'N'
    --            where a.use_yn = 'Y'
    --              and a.del_yn = 'N'
    --              and a.status = 'C'
    --              and a.accounting_type in ('A','B','D')
	-- 			 and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
	-- 			 {IN_STR}
    --            group by b.movie_no, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
    --         ) data2
    --         on data1.sp_corp_detail_no = data2.sp_corp_detail_no
    --          and data1.sales_kind = data2.sales_kind
    --     ) data

    --   ) rdata
    -- LEFT OUTER JOIN
    --            (SELECT b.sales_kind,
    --                    sum(b.accounting_price) add_sale_price
    --               FROM accounting_summary a
    --                    LEFT JOIN accounting_rawdata b
    --                       ON     a.accounting_summary_no =
    --                                 b.accounting_summary_no
    --                          AND b.use_yn = 'Y'
    --                          AND b.del_yn = 'N'
    --              WHERE     a.use_yn = 'Y'
    --                    AND a.del_yn = 'N'
    --                    AND a.settlement_date < concat(:st_date, '-01')
    --                    AND a.status = 'C'
    --                    AND a.accounting_type IN ('A', 'B', 'D')
	-- 				   {IN_STR}
    --             GROUP BY b.sales_kind) pre_sale_data
    --               ON rdata.sales_kind = pre_sale_data.sales_kind) alldata
-- order by sales_kind_name asc, depth asc, sp_corp_detail_name asc;
order by sales_kind_name1 asc, depth asc, sp_corp_detail_name asc;


--[GetCorpSalesReport_bak20240126]
select
*
from (
    select
      alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 1 as depth
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
    		  and a.settlement_date < concat(:st_date,'-01')
    	      and a.status = 'C'
    		  and a.accounting_type in ('A','B','D')
    	      and b.sp_corp_detail_no = rdata.sp_corp_detail_no
    	      and b.sales_kind = rdata.sales_kind
	      {IN_STR}
    		   ),0) as add_sale_price
      from (         
        select
    	  data.sp_corp_detail_no
    	, data.sp_corp_detail_name
      , data.sales_kind_name
    	, data.sales_kind
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
    	, SUM(accounting_price) as sub_tot_sum
        from (
          select
          	data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
          	select 
          	  a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
          	from sales_kind a
          	left join common_code b
          	on a.sales_kind = b.type_code
          	left join sp_corp_detail c
          	on a.sp_corp_detail_no = c.sp_corp_detail_no
			left join sp_corp d
			on c.sp_corp_no = d.sp_corp_no
          	where a.sales_kind is not null
          	  and b.type_name= 'SALES_KIND'
				and c.use_yn='Y' 
				and c.del_yn = 'N'
				and d.use_yn = 'Y'
				and d.del_yn = 'N'
			  {IN_STR1}
          ) data1
          left join (
          	select
          		  b.movie_no
          		, a.settlement_date
          		, a.sp_corp_detail_no
          		, sum(b.accounting_price) as accounting_price
          		, b.sales_kind
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
          			and b.use_yn = 'Y'
          			and b.del_yn = 'N'
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
          	    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
		    {IN_STR}
          	  group by b.movie_no, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
          	and data1.sales_kind = data2.sales_kind
        ) data
        group by data.sp_corp_detail_no
        		, data.sales_kind_name
        		, data.sales_kind
        		, data.sp_corp_detail_name
      ) rdata
    ) alldata
    union all
    select
        0 as sp_corp_detail_no
      , sales_kind_name as sp_corp_detail_name
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 2 as depth
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
      			  and a.settlement_date < concat(:st_date,'-01')
      		      and a.status = 'C'
      			  and a.accounting_type in ('A','B','D')
      		      and b.sales_kind = rdata.sales_kind
		      {IN_STR}
      			   ),0) as add_sale_price
      from (         
        select
        		  concat(data.sales_kind_name, ' 소계') as sales_kind_name
        		, data.sales_kind
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        		, SUM(accounting_price) as sub_tot_sum
        from (
          select
          	data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
          	select 
          	  a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
          	from sales_kind a
          	left join common_code b
          	on a.sales_kind = b.type_code
          	left join sp_corp_detail c
          	on a.sp_corp_detail_no = c.sp_corp_detail_no
			left join sp_corp d
			on c.sp_corp_no = d.sp_corp_no
          	where a.sales_kind is not null
          	  and b.type_name= 'SALES_KIND'
				and c.use_yn='Y' 
				and c.del_yn = 'N'
				and d.use_yn = 'Y'
				and d.del_yn = 'N'
			  {IN_STR1}
          ) data1
          left join (
          	select
          		  b.movie_no
          		, a.settlement_date
          		, a.sp_corp_detail_no
          		, sum(b.accounting_price) as accounting_price
          		, b.sales_kind
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
          			and b.use_yn = 'Y'
          			and b.del_yn = 'N'
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
          	    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
		    {IN_STR}
          	  group by b.movie_no, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
          	and data1.sales_kind = data2.sales_kind
        ) data
        group by data.sales_kind_name
        		, data.sales_kind
      ) rdata
    ) alldata
	union all
    select
        99999999 as sp_corp_detail_no
      , sales_kind_name as sp_corp_detail_name
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 2 as depth
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
      			  and a.settlement_date < concat(:st_date,'-01')
      		      and a.status = 'C'
      			  and a.accounting_type in ('A','B','D')
      		      -- and b.sales_kind = rdata.sales_kind
				  {IN_STR2}
		      {IN_STR}
      			   ),0) as add_sale_price
      from (         
        select
        		  '합계' as sales_kind_name
        		, 'XXX' sales_kind
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        		, SUM(accounting_price) as sub_tot_sum
        from (
          select
          	data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.sp_corp_detail_name, data2.movie_no, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
          	select 
          	  a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
          	from sales_kind a
          	left join common_code b
          	on a.sales_kind = b.type_code
          	left join sp_corp_detail c
          	on a.sp_corp_detail_no = c.sp_corp_detail_no
			left join sp_corp d
			on c.sp_corp_no = d.sp_corp_no
          	where a.sales_kind is not null
          	  and b.type_name= 'SALES_KIND'
				and c.use_yn='Y' 
				and c.del_yn = 'N'
				and d.use_yn = 'Y'
				and d.del_yn = 'N'
				{IN_STR5}
			  {IN_STR1}
          ) data1
          left join (
          	select
          		  '' movie_no
          		, a.settlement_date
          		, a.sp_corp_detail_no
          		, sum(b.accounting_price) as accounting_price
          		, '' sales_kind
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
          			and b.use_yn = 'Y'
          			and b.del_yn = 'N'
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
          	    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
				{IN_STR2}
		    {IN_STR}
          	  group by  a.settlement_date -- , a.sp_corp_detail_no, b.sales_kind, b.movie_no,
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
          	-- and data1.sales_kind = data2.sales_kind
        ) data
       -- group by data.sales_kind_name        		, data.sales_kind
      ) rdata
    ) alldata
) talldata
order by sales_kind asc,sales_kind_name asc, depth asc, sp_corp_detail_name asc
;

--[GetAnalSalesReport]
select
 *
 from (
 select
 alldata.*
 , (ifnull(sub_tot_sum,0) + IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and b.sp_corp_detail_no = alldata.sp_corp_detail_no
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   256,
--   627,
--   628,
--   629
-- )
 and b.movie_no = alldata.movie_no
 ),0)) as total_sum
 , IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and b.sp_corp_detail_no = alldata.sp_corp_detail_no
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 and b.movie_no = alldata.movie_no
 ),0) as add_sale_price
 , 1 as depth
 from (
 select
 rdata.*
 from (
 select
		data.movie_no
		, data.movie_name
		, data.movie_name1
		, data.service_open_date
		, data.publication_code
		, data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.sales_kind
		, data.sales_kind_name
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
    	--, SUM(accounting_price) as sub_tot_sum
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
 from (
 select
 a.movie_no, a.movie_name,a.movie_name movie_name1, a.service_open_date,b.sp_corp_detail_no,b.sp_corp_detail_name,b.sales_kind,b.sales_kind_name, a.publication_code, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
 from movie a
 left join (
 select
 b.movie_no
 , a.settlement_date
 , c.sp_corp_detail_no
 , c.sp_corp_detail_name
 , sum(b.accounting_price) as accounting_price
 , b.sales_kind
 , d.type_data as sales_kind_name -- , FN_GET_COMMON_TYPE_DATA('SALES_KIND',b.sales_kind) sales_kind_name -- b.sales_kind_name
 from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 left join sp_corp_detail c
 on a.sp_corp_detail_no = c.sp_corp_detail_no
 left join common_code d
 on b.sales_kind = d.type_code and d.type_name='SALES_KIND' 
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
 -- and a.settlement_date between concat('2019','-01') and concat('2023','-12')
 group by b.movie_no, a.settlement_date,b.sp_corp_detail_no,b.sales_kind,b.sales_kind_name
 ) b
 on a.movie_no = b.movie_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--  and a.movie_no in (
--  256,
--   627,
--   628,
--   629
-- )
 ) data
 group by data.movie_no
 , data.movie_name
 , data.service_open_date
 , data.publication_code
 , data.sp_corp_detail_no
 , data.sp_corp_detail_name
 , data.sales_kind
 , data.sales_kind_name
 ) rdata
 ) alldata
 union all
 select
  alldata.*
 , (ifnull(sub_tot_sum,0) + ifnull((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
  and b.sales_kind = alldata.sales_kind
 and b.movie_no = alldata.movie_no
 {IN_STR}
 {SALESKIND_STR}
 {MOVIE_STR}
 ), 0)) as total_sum
 , IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and b.sales_kind = alldata.sales_kind
 and b.movie_no = alldata.movie_no
 {IN_STR}
 {SALESKIND_STR}
 {MOVIE_STR}
 ),0) as add_sale_price
 , 2 as depth
 from (
 select
 rdata.*
 from (
 select
  data.movie_no
 , movie_name
 , movie_name1
 , '' service_open_date
 , '' publication_code
 , null sp_corp_detail_no
 , '소계' sp_corp_detail_name 
 , data.sales_kind
 , '' sales_kind_name
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
 from (
 select
  a.movie_no, a.movie_name,a.movie_name movie_name1, a.service_open_date,b.sales_kind, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
 from movie a
 left join (
 select
 b.movie_no
 , a.settlement_date
 , b.sales_kind
 , sum(b.accounting_price) as accounting_price
 from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.status = 'C'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.accounting_type in ('A','B','D')
 and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
 {IN_STR}
 {SALESKIND_STR}
 {MOVIE_STR}
 group by b.movie_no, a.settlement_date,b.sales_kind
 ) b
 on a.movie_no = b.movie_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
--  and a.movie_no in (
--   502,
--   846,
--   626)

 {SALESKIND_STR}
 {MOVIE_STR}
 ) data
 group by data.movie_no
 , data.movie_name
 , data.service_open_date
 , data.sales_kind
 ) rdata
 ) alldata
 union all
 select
 0 as movie_no, null movie_name, '흐황황황황황황' movie_name1, ' ' as serice_open_date, '' as publication_code
 , '' sp_corp_detail_no
 , '합계' as sp_corp_detail_name
 , '' sales_kind
 , '' sales_kind_name
 , alldata.*
 , (ifnull(sub_tot_sum,0) + ifnull((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
--  and a.sales_date is not null
--  and a.total_sales_price is not null and a.total_sales_price>0
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 ), 0)) as total_sum
, IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
--  and a.sales_date is not null
--  and a.total_sales_price is not null and a.total_sales_price>0
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 ),0) as add_sale_price
 , 9 as depth
 from (
 select
 rdata.*
 from (
 select
  SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
 from (
 select
 a.movie_no, a.movie_name,a.movie_name movie_name1, a.service_open_date, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
 from movie a
 left join (
 select
 b.movie_no
 , a.settlement_date
 , sum(b.accounting_price) as accounting_price
 from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.status = 'C'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.accounting_type in ('A','B','D')
 and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 {IN_STR}
 {SALESKIND_STR}
 {MOVIE_STR}
 group by b.movie_no, a.settlement_date
 ) b
 on a.movie_no = b.movie_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 ) data
 ) rdata
 ) alldata
 ) talldata
  -- order by  movie_name is null ASC, movie_name asc, sales_kind asc, depth asc, sp_corp_detail_name asc, service_open_date desc 
  order by movie_name1 asc, sales_kind asc, depth asc, sp_corp_detail_name asc, service_open_date desc 
 ;

--[GetAnalSalesReport_back20240123]
select
 *
 from (
 select
 alldata.*
 , (ifnull(sub_tot_sum,0) + IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and b.sp_corp_detail_no = alldata.sp_corp_detail_no
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   256,
--   627,
--   628,
--   629
-- )
 and b.movie_no = alldata.movie_no
 ),0)) as total_sum
 , IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and b.sp_corp_detail_no = alldata.sp_corp_detail_no
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 and b.movie_no = alldata.movie_no
 ),0) as add_sale_price
 , 1 as depth
 from (
 select
 rdata.*
 from (
 select
		data.movie_no
		, data.movie_name
		, data.service_open_date
		, data.publication_code
		, data.sp_corp_detail_no
		, data.sp_corp_detail_name
		, data.sales_kind
		, data.sales_kind_name
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
    	--, SUM(accounting_price) as sub_tot_sum
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
 from (
 select
 a.movie_no, a.movie_name, a.service_open_date,b.sp_corp_detail_no,b.sp_corp_detail_name,b.sales_kind,b.sales_kind_name, a.publication_code, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
 from movie a
 left join (
 select
 b.movie_no
 , a.settlement_date
 , c.sp_corp_detail_no
 , c.sp_corp_detail_name
 , sum(b.accounting_price) as accounting_price
 , b.sales_kind
 , FN_GET_COMMON_TYPE_DATA('SALES_KIND',b.sales_kind) sales_kind_name -- b.sales_kind_name
 from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 left join sp_corp_detail c
 on a.sp_corp_detail_no = c.sp_corp_detail_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
 -- and a.settlement_date between concat('2019','-01') and concat('2023','-12')
 group by b.movie_no, a.settlement_date,b.sp_corp_detail_no,b.sales_kind,b.sales_kind_name
 ) b
 on a.movie_no = b.movie_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--  and a.movie_no in (
--  256,
--   627,
--   628,
--   629
-- )
 ) data
 group by data.movie_no
 , data.movie_name
 , data.service_open_date
 , data.publication_code
 , data.sp_corp_detail_no
 , data.sp_corp_detail_name
 , data.sales_kind
 , data.sales_kind_name
 ) rdata
 ) alldata
 union all
 select
 0 as movie_no, '합계' as movie_name, ' ' as serice_open_date, '' as publication_code
 , '' sp_corp_detail_no
 , '' sp_corp_detail_name
 , '' sales_kind
 , '' sales_kind_name
 , alldata.*
 , (ifnull(sub_tot_sum,0) + ifnull((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
--  and a.sales_date is not null
--  and a.total_sales_price is not null and a.total_sales_price>0
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 ), 0)) as total_sum
, IFNULL((select sum(b.accounting_price) from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.settlement_date < concat(:st_date,'-01')
 and a.status = 'C'
 and a.accounting_type in ('A','B','D')
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
--  and a.sales_date is not null
--  and a.total_sales_price is not null and a.total_sales_price>0
  {IN_STR}
  {SALESKIND_STR}
  {MOVIE_STR}
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 ),0) as add_sale_price
 , 2 as depth
 from (
 select
 rdata.*
 from (
 select
  SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
 , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
 , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
 , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
 , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
 , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
 , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
 , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
 , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
 , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
 , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
 , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
 , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
 , SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
 from (
 select
 a.movie_no, a.movie_name, a.service_open_date, b.settlement_date, ifnull(b.accounting_price,0) as accounting_price
 from movie a
 left join (
 select
 b.movie_no
 , a.settlement_date
 , sum(b.accounting_price) as accounting_price
 from accounting_summary a
 left join accounting_rawdata b
 on a.accounting_summary_no = b.accounting_summary_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and a.status = 'C'
 and b.use_yn = 'Y'
 and b.del_yn = 'N'
 and a.accounting_type in ('A','B','D')
 and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
--   and b.movie_no in (
--   256,
--   627,
--   628,
--   629
-- )
 {IN_STR}
 {SALESKIND_STR}
 {MOVIE_STR}
 group by b.movie_no, a.settlement_date
 ) b
 on a.movie_no = b.movie_no
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 ) data
 ) rdata
 ) alldata
 ) talldata
 order by depth asc, movie_name asc, sales_kind_name asc,sp_corp_detail_name asc, service_open_date desc
 ;


--[GetAnalSalesReport___]
select
*
from (
    select
      alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 1 as depth
    from (  
      select
    	  rdata.*
    	, IFNULL((select sum(b.accounting_price) from accounting_summary a 
    		left join accounting_rawdata b
    		on a.accounting_summary_no = b.accounting_summary_no
    		where a.use_yn = 'Y'
    		  and a.del_yn = 'N'
    		  and a.settlement_date < concat(:st_date,'-01')
    	      and a.status = 'C'
    		  and a.accounting_type in ('A','B','D')
			  and b.use_yn = 'Y'
    		  and b.del_yn = 'N'
    	      and b.sp_corp_detail_no = rdata.sp_corp_detail_no
    	      and b.sales_kind = rdata.sales_kind
		  {MOVIE_STR1}	  
	      {IN_STR}
    		   ),0) as add_sale_price
      from (         
        select
    	  data.sp_corp_detail_no
    	, data.sp_corp_detail_name
        , data.sales_kind_name
    	, data.sales_kind
		, data.movie_no
    	, data.movie_name
		, data.service_open_date
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
    	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
    	--, SUM(accounting_price) as sub_tot_sum
		, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
        from (
          select
          	data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.sp_corp_detail_name, data2.movie_no, data2.movie_name,data2.service_open_date, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
          	select 
          	  a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
          	from sales_kind a
          	left join common_code b
          	on a.sales_kind = b.type_code
          	left join sp_corp_detail c
          	on a.sp_corp_detail_no = c.sp_corp_detail_no
			left join sp_corp d
			on c.sp_corp_no = d.sp_corp_no
          	where a.sales_kind is not null
          	  and b.type_name= 'SALES_KIND'
				and c.use_yn='Y' 
				and c.del_yn = 'N'
				and d.use_yn = 'Y'
				and d.del_yn = 'N'
			  {IN_STR1}
          ) data1
          left join (
          	select
          		  b.movie_no
				, m.movie_name
          		, m.service_open_date
          		, a.settlement_date
          		, a.sp_corp_detail_no
          		, sum(b.accounting_price) as accounting_price
          		, b.sales_kind
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
			  left join movie m
          	  on b.movie_no = m.movie_no
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
          	    and a.accounting_type in ('A','B','D')
				and b.use_yn = 'Y'
          		and b.del_yn = 'N'
				{MOVIE_STR2}
          	    -- and a.settlement_date between concat('2023','-01') and concat(:st_date,'-12')
				and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
		    {IN_STR}
          	  group by b.movie_no,m.movie_name, a.settlement_date, a.sp_corp_detail_no, b.sales_kind
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
          	and data1.sales_kind = data2.sales_kind
        ) data
        group by data.sp_corp_detail_no
        		, data.sales_kind_name
        		, data.sales_kind
				, data.movie_name
        		, data.sp_corp_detail_name
      ) rdata
    ) alldata {MOVIE_STR4}
    union all
    select
        99999999 as sp_corp_detail_no
      , sales_kind_name as sp_corp_detail_name
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
      , 2 as depth
    from (  
      select
      		  rdata.*
      		, IFNULL((select sum(b.accounting_price) from accounting_summary a 
      			left join accounting_rawdata b
      			on a.accounting_summary_no = b.accounting_summary_no
      			where a.use_yn = 'Y'
      			  and a.del_yn = 'N'
      			  and a.settlement_date < concat(:st_date,'-01')
      		      and a.status = 'C'
      			  and a.accounting_type in ('A','B','D')
				  and b.use_yn = 'Y'
      			  and b.del_yn = 'N'
			  {MOVIE_STR2}
      		      -- and b.sales_kind = rdata.sales_kind
		      {IN_STR}
      			   ),0) as add_sale_price
      from (         
        select
        		  '합계' as sales_kind_name
        		, 'XXX' sales_kind
				, null movie_no
        		, '' movie_name
        		, '' service_open_date
				, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-3 as char(4)), accounting_price, 0)) AS under_3
				, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-2 as char(4)), accounting_price, 0)) AS under_2
				, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED)-1 as char(4)), accounting_price, 0)) AS under_1
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        		--, SUM(accounting_price) as sub_tot_sum
				, SUM(IF(left(settlement_date,4) = cast(cast(:st_date as SIGNED) as char(4)), accounting_price, 0)) AS sub_tot_sum
        from (
          select
          	data1.sp_corp_detail_no, data1.sales_kind, data1.type_data as sales_kind_name, data1.sp_corp_detail_name, data2.movie_no,data2.movie_name, data2.settlement_date, ifnull(data2.accounting_price,0) as accounting_price
          from (
          	select 
          	  a.sp_corp_detail_no, a.sales_kind, b.type_data, c.sp_corp_detail_name
          	from sales_kind a
          	left join common_code b
          	on a.sales_kind = b.type_code
          	left join sp_corp_detail c
          	on a.sp_corp_detail_no = c.sp_corp_detail_no
			left join sp_corp d
			on c.sp_corp_no = d.sp_corp_no
          	where a.sales_kind is not null
          	  and b.type_name= 'SALES_KIND'
				and c.use_yn='Y' 
				and c.del_yn = 'N'
				and d.use_yn = 'Y'
				and d.del_yn = 'N'
			  {IN_STR1}
          ) data1
          left join (
          	select
          		  '' movie_no
          		, '' movie_name
          		, '' service_open_date
          		, a.settlement_date
          		, a.sp_corp_detail_no
          		, sum(b.accounting_price) as accounting_price
          		, '' sales_kind
          	  from accounting_summary a 
          	  left join accounting_rawdata b
          	  on a.accounting_summary_no = b.accounting_summary_no
			  left join movie m
          	  on b.movie_no = m.movie_no
          	  where a.use_yn = 'Y'
          	    and a.del_yn = 'N'
          	    and a.status = 'C'
				and b.use_yn = 'Y'
          		and b.del_yn = 'N'
          	    and a.accounting_type in ('A','B','D')
				{MOVIE_STR2}
          	    and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
				--and a.settlement_date between concat('2023','-01') and concat(:st_date,'-12')
		    {IN_STR}
          	  group by  a.settlement_date -- , a.sp_corp_detail_no, b.sales_kind, b.movie_no,
            ) data2
            on data1.sp_corp_detail_no = data2.sp_corp_detail_no
          	-- and data1.sales_kind = data2.sales_kind
        ) data
       -- group by data.sales_kind_name        		, data.sales_kind
      ) rdata
    ) alldata
) talldata
order by depth asc,movie_name is null asc, movie_name asc, sales_kind asc,sales_kind_name asc,  sp_corp_detail_name asc
;



--[GetCorpSalesReport_bak20170825]
select
*
from (
	select
	  alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
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
			  and a.settlement_date < concat(:st_date,'-01')
		      and a.status = 'C'
			  and a.accounting_type in ('A','B','D')
		      and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		      and b.sales_kind = rdata.sales_kind
			  {IN_STR} ),0) as add_sale_price
	  from (            
	    select
		  data.sp_corp_detail_no
		, data.sales_kind_name
		, data.sales_kind
		, data.depth
		, scd.sp_corp_detail_name
		, MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		, MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		, MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		, MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		, MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		, MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		, MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		, MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		, MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		, MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		, MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		, MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		, SUM(accounting_price) as sub_tot_sum
	    from(
		select
			  a.settlement_date
		  , a.sp_corp_detail_no
		  , b.sales_kind_name
		  , b.sales_kind
			, sum(b.accounting_price) as accounting_price
		  , 1 as depth
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
				and b.use_yn = 'Y'
				and b.del_yn = 'N'
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.status = 'C'
		  and a.accounting_type in ('A','B','D')
		  and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
		  {IN_STR} 
		group by a.settlement_date, a.sp_corp_detail_no, b.sales_kind_name, b.sales_kind
	    ) data  
	    left join sp_corp_detail scd 
	    on data.sp_corp_detail_no = scd.sp_corp_detail_no
	    group by data.sp_corp_detail_no
		, data.sales_kind_name
		, data.sales_kind
		, scd.sp_corp_detail_name
	  ) rdata
	) alldata
	union
	select
	  alldata.*
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
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
		  and a.settlement_date < concat(:st_date,'-01')
		and a.status = 'C'
		and a.accounting_type in ('A','B','D')
		and b.sp_corp_detail_no = rdata.sp_corp_detail_no
		and b.sales_kind = rdata.sales_kind
		{IN_STR} ),0) as add_sale_price
	      from (  
	      select
		    data.sp_corp_detail_no
		  , data.sales_kind_name
		  , data.sales_kind
		  , data.depth
		  , concat(data.sales_kind_name, ' 소계') as sp_corp_detail_name      
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		  , MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		  , SUM(accounting_price) as sub_tot_sum
	      from(
		select
			  a.settlement_date
		  , 0 as sp_corp_detail_no
		  , b.sales_kind_name
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
		  and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
		  {IN_STR} 
		group by a.settlement_date, b.sales_kind_name, b.sales_kind
	      ) data 
	      group by data.sp_corp_detail_no
		  , data.sales_kind_name
		  , data.sales_kind
	  ) rdata   
	) alldata 
union all
select
    0 as sp_corp_detail_no, '합계' as sales_kind_name, 'R9999999' as sales_kind, 3 as depth, '합계' as sp_corp_detail_name
  , alldata.*
  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
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
    		  and a.settlement_date < concat(:st_date,'-01')
    		and a.status = 'C'
			and a.accounting_type in ('A','B','D')
			{IN_STR} ),0) as add_sale_price
  from (  
    select
    		    MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
    		  , MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
    		  , SUM(accounting_price) as sub_tot_sum
    from(
        select
    			  a.settlement_date
    		  , 0 as sp_corp_detail_no
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
    		  and a.settlement_date between concat(cast(cast(:st_date as SIGNED)-3 as char(4)),'-01') and concat(:st_date,'-12')
			  {IN_STR} 
    		group by a.settlement_date
    ) data    
  ) rdata
) alldata  
) talldata
order by sales_kind asc, depth asc;


-- [GetReportAcount]
select
*
from (
	select
	    alldata.*
	  , 1 as depth
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , (ifnull(mg_price,0) - (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0))) as rest_price
	from (  
	  select
	    rdata.*
	    , IFNULL((
		select 
		  sum(b.accounting_price) 
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		left join movie m
		  on b.movie_no = m.movie_no
		left join sp_corp sc
		  on m.sp_corp_no = sc.sp_corp_no   
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < concat(:st_date,'-01')
		  and a.status = 'Ccccc'
		  and a.accounting_type in ('AAAAAA')
		  and m.mg_yn = 'YYYYY'
		  and m.sp_corp_no = rdata.sp_corp_no
		  and m.movie_no = rdata.movie_no
	    ),0) as add_sale_price
	  from (
	    select
			data.movie_no
		, data.movie_name
		, data.mg_price
		, data.publication_code
		, data.sp_corp_no
		, data.sp_corp_name
		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		, SUM(IFNULL(accounting_price,0)) as sub_tot_sum
		    from (
		      select
				  a.movie_no
				, a.movie_name
				, a.mg_price
				, a.publication_code
				, b.sp_corp_no
				, b.sp_corp_name
				, SUM(ifnull(c.accounting_price,0)) as accounting_price
				, c.settlement_date
		      from movie a
		      left join sp_corp b
		      on a.sp_corp_no = b.sp_corp_no
			left join (select
				aa.accounting_summary_no, aa.settlement_date, bb.movie_no, bb.accounting_price
				from accounting_summary aa
				left join accounting_rawdata bb
				on aa.accounting_summary_no = bb.accounting_summary_no
					and bb.use_yn = 'Y'
					and bb.del_yn = 'N'
				where aa.use_yn = 'Y'
					and aa.del_yn = 'N'
					and aa.status = 'Ccccc'
					and aa.accounting_type in ('AAAAAAA')
					and aa.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')  
			) c
			on a.movie_no = c.movie_no 
		      where a.mg_yn = 'YYYYYY'
			and a.use_yn = 'Y'
			and a.del_yn = 'N'
			{IN_STR1}
		      group by a.movie_no
			, a.movie_name
			, a.mg_price
			, b.sp_corp_no
			, b.sp_corp_name
			, c.settlement_date
		    ) data
			  where 1=1
			  {IN_STR}
		    group by data.movie_no
			  , data.movie_name
			  , data.mg_price
			  , data.publication_code
				  , data.sp_corp_no
			  , data.sp_corp_name
	  ) rdata
	) alldata 
) talldata
order by sp_corp_no asc, depth asc, movie_name asc
;

-- [GetRekuckSalesReport]
select
*
from (
	select
	    alldata.*
	  , 1 as depth
	  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
	  , (ifnull(mg_price,0) - (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0))) as rest_price
	from (  
	  select
	    rdata.*
	    , IFNULL((
		select 
		  sum(b.accounting_price) 
		from accounting_summary a 
		left join accounting_rawdata b
		on a.accounting_summary_no = b.accounting_summary_no
		  and b.use_yn = 'Y'
		  and b.del_yn = 'N'
		left join movie m
		  on b.movie_no = m.movie_no
		left join sp_corp sc
		  on m.sp_corp_no = sc.sp_corp_no   
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  and a.settlement_date < concat(:st_date,'-01')
		  and a.status = 'C'
		  and a.accounting_type in ('E')
		  and m.mg_yn = 'Y'
		  and m.sp_corp_no = rdata.sp_corp_no
		  and m.movie_no = rdata.movie_no
	    ),0) as add_sale_price
	  from (
	    select
			data.movie_no
		, data.movie_name
		, data.mg_price
		, data.publication_code
		, data.sp_corp_no
		, data.sp_corp_name
		, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		, SUM(IFNULL(accounting_price,0)) as sub_tot_sum
		    from (
		      select
				  a.movie_no
				, a.movie_name
				, a.mg_price
				, a.publication_code
				, b.sp_corp_no
				, b.sp_corp_name
				, SUM(ifnull(c.accounting_price,0)) as accounting_price
				, c.settlement_date
		      from movie a
		      left join sp_corp b
		      on a.sp_corp_no = b.sp_corp_no
			left join (select
				aa.accounting_summary_no, aa.settlement_date, bb.movie_no, bb.accounting_price
				from accounting_summary aa
				left join accounting_rawdata bb
				on aa.accounting_summary_no = bb.accounting_summary_no
					and bb.use_yn = 'Y'
					and bb.del_yn = 'N'
				where aa.use_yn = 'Y'
					and aa.del_yn = 'N'
					and aa.status = 'C'
					and aa.accounting_type in ('E')
					and aa.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')  
			) c
			on a.movie_no = c.movie_no 
		      where a.mg_yn = 'Y'
			and a.use_yn = 'Y'
			and a.del_yn = 'N'
			{IN_STR1}
		      group by a.movie_no
			, a.movie_name
			, a.mg_price
			, b.sp_corp_no
			, b.sp_corp_name
			, c.settlement_date
		    ) data
			  where 1=1
			  {IN_STR}
		    group by data.movie_no
			  , data.movie_name
			  , data.mg_price
			  , data.publication_code
				  , data.sp_corp_no
			  , data.sp_corp_name
	  ) rdata
	) alldata 
	union all
	select
		    0 as movie_no
		  , '합계' as movie_name
		  , alldata.mg_price
		  , '' as publication_code
		  , alldata.sp_corp_no
		  , ' ' as sp_corp_name
		  , col_1
		  , col_2
		  , col_3
		  , col_4
		  , col_5
		  , col_6
		  , col_7
		  , col_8
		  , col_9
		  , col_10
		  , col_11
		  , col_12
		  , sub_tot_sum
		  , add_sale_price
		  , 2 as depth
		  , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
		  , (ifnull(mg_price,0) - (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0))) as rest_price
		from ( 
	    select
	      rdata.*
	      , IFNULL((
		  select 
		    sum(b.accounting_price) 
		  from accounting_summary a 
		  left join accounting_rawdata b
		  on a.accounting_summary_no = b.accounting_summary_no
		    and b.use_yn = 'Y'
		    and b.del_yn = 'N'
		  left join movie m
		    on b.movie_no = m.movie_no
		  left join sp_corp sc
		    on m.sp_corp_no = sc.sp_corp_no        
		  where a.use_yn = 'Y'
		    and a.del_yn = 'N'
		    and a.settlement_date < concat(:st_date,'-01')
		    and a.status = 'C'
		    and a.accounting_type in ('E')
		    and m.mg_yn = 'Y'
		    and m.sp_corp_no = rdata.sp_corp_no
	      ),0) as add_sale_price
	      , IFNULL((select SUM(mg_price) from movie aa where aa.mg_yn = 'Y'
			  and aa.use_yn = 'Y'
			  and aa.del_yn = 'N'  
			  and aa.sp_corp_no = rdata.sp_corp_no),0) as mg_price
	    from (
	      select 
		    data.sp_corp_no
		  , data.sp_corp_name
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
		  , SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
		  , SUM(IFNULL(accounting_price,0)) as sub_tot_sum
		    from (
		      select
				  a.movie_no
				, a.movie_name
				, a.mg_price
				, b.sp_corp_no
				, b.sp_corp_name
				, SUM(ifnull(c.accounting_price,0)) as accounting_price
				, c.settlement_date
		      from movie a
		      left join sp_corp b
		      on a.sp_corp_no = b.sp_corp_no
			left join (select
				aa.accounting_summary_no, aa.settlement_date, bb.movie_no, bb.accounting_price
				from accounting_summary aa 
				left join accounting_rawdata bb
				on aa.accounting_summary_no = bb.accounting_summary_no
					and bb.use_yn = 'Y'
					and bb.del_yn = 'N'
				where aa.use_yn = 'Y'
					and aa.del_yn = 'N'
					and aa.status = 'C'
					and aa.accounting_type in ('E')
					and aa.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')  
			) c
			on a.movie_no = c.movie_no 
		      where a.mg_yn = 'Y'
			and a.use_yn = 'Y'
			and a.del_yn = 'N'
			{IN_STR1}
		      group by a.movie_no
			, a.movie_name
			, a.mg_price
			, b.sp_corp_no
			, b.sp_corp_name
			, c.settlement_date
		    ) data
			where 1=1
			{IN_STR}
		    group by 
		    data.sp_corp_no
			  , data.sp_corp_name
	  ) rdata
	) alldata  
) talldata
order by sp_corp_no asc, depth asc, movie_name asc
;

-- [GetRawSalesReport]
select
*
from (
  select
      alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 1 as depth
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
              	  and a.settlement_date < concat(:st_date,'-01')
                  and a.status = 'C'
            	    and a.accounting_type in ('C')
                  and b.movie_no = rdata.movie_no
      	   ),0) as add_sale_price
    from (       
      select
          	  data.movie_no
          	, data.movie_name
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
          	, SUM(accounting_price) as sub_tot_sum
      from (
          select 
            b.movie_no, b.movie_name, c.settlement_date, ifnull(c.accounting_price,0) as accounting_price 
          from vw_raw_movie a 
          left join movie b
          on a.movie_no = b.movie_no
          left join (
            select
            	  b.movie_no
            	, a.settlement_date
            	, SUM(IFNULL(b.accounting_price,0)) as accounting_price
            	from accounting_summary a 
            	left join accounting_rawdata b
            	on a.accounting_summary_no = b.accounting_summary_no
              		and b.use_yn = 'Y'
              		and b.del_yn = 'N'
            	where a.use_yn = 'Y'
            	  and a.del_yn = 'N'
                and a.status = 'C'
                and a.accounting_type in ('C')
            	  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
            	group by b.movie_no, a.settlement_date  
          ) c
          on a.movie_no = c.movie_no
		  where 1=1
		  {IN_STR}
      ) data
      group by data.movie_no
          	, data.movie_name
    ) rdata
  ) alldata
  union all
  select
      0 as movie_no
    , '합계' as movie_name
    , alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 2 as depth
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
              	  and a.settlement_date < concat(:st_date,'-01')
                  and a.status = 'C'
            	    and a.accounting_type in ('C')
					{IN_STR1}
      	   ),0) as add_sale_price
    from (       
      select
          	  SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
          	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
          	, SUM(accounting_price) as sub_tot_sum
      from (
          select 
            b.movie_no, b.movie_name, c.settlement_date, ifnull(c.accounting_price,0) as accounting_price 
          from vw_raw_movie a 
          left join movie b
          on a.movie_no = b.movie_no
          left join (
            select
            	  b.movie_no
            	, a.settlement_date
            	, SUM(IFNULL(b.accounting_price,0)) as accounting_price
            	from accounting_summary a 
            	left join accounting_rawdata b
            	on a.accounting_summary_no = b.accounting_summary_no
              		and b.use_yn = 'Y'
              		and b.del_yn = 'N'
            	where a.use_yn = 'Y'
            	  and a.del_yn = 'N'
                and a.status = 'C'
                and a.accounting_type in ('C')
            	  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
            	group by b.movie_no, a.settlement_date  
          ) c
          on a.movie_no = c.movie_no
		  where 1=1
		  {IN_STR}
      ) data
    ) rdata
  ) alldata
) talldata
order by depth asc, movie_name asc

-- [GetPinkSalesReport]
select
*
from (
  select
      alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 1 as depth
    , movie_name as movie_name1
  from ( 
      select
          rdata.*
        , IFNULL((select sum(b.accounting_price) from accounting_summary a 
                  left join accounting_rawdata b
                  on a.accounting_summary_no = b.accounting_summary_no
                  		and b.use_yn = 'Y'
                  		and b.del_yn = 'N'
                  left join common_code c
                  on b.distribution_enterprise_type = c.type_code
                    and c.type_name = 'DISTRIBUTION_ENTERPRISE_TYPE'
                  where a.use_yn = 'Y'
                    and a.del_yn = 'N'
                    and a.status = 'C'
                    and a.accounting_type in ('B')
                    and b.movie_no = rdata.movie_no
                    and c.parent_type_code = rdata.platform_type
					and a.settlement_date < concat(:st_date,'-01')
        	   ),0) as add_sale_price
      from (       
          select
              	  data.movie_no
              	, data.movie_name
              	, data.service_open_date
				, data.publication_code
              	, data.platform_type
              	, data.platform_type_name
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
              	, SUM(accounting_price) as sub_tot_sum
          from (
              select
                  a.movie_no
                , a.movie_name
                , a.service_open_date
				, a.publication_code
                , a.platform_type
                , a.platform_type_name
                , b.settlement_date
                , ifnull(b.accounting_price, 0) as accounting_price
              from vw_pink_moive a left join (
                select
                	  b.movie_no
                	, a.settlement_date
                  , b.distribution_enterprise_type
                	, SUM(IFNULL(b.accounting_price,0)) as accounting_price
                  , c.parent_type_code as platform_type
                from accounting_summary a 
                left join accounting_rawdata b
                on a.accounting_summary_no = b.accounting_summary_no
                		and b.use_yn = 'Y'
                		and b.del_yn = 'N'
                left join common_code c
                on b.distribution_enterprise_type = c.type_code
                  and c.type_name = 'DISTRIBUTION_ENTERPRISE_TYPE'
                where a.use_yn = 'Y'
                  and a.del_yn = 'N'
                  and a.status = 'C'
                  and a.accounting_type in ('B')
                  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
                group by b.movie_no, a.settlement_date, b.distribution_enterprise_type
              ) b
              on a.movie_no = b.movie_no
                and a.platform_type = b.platform_type
				where 1=1
				{IN_STR1}
          ) data 
          group by data.movie_no
              	, data.movie_name
              	, data.service_open_date
				, data.publication_code
              	, data.platform_type
              	, data.platform_type_name
      ) rdata
  ) alldata
  union all
  select
      movie_no
    , '소계' as movie_name
    , ' ' as service_open_date
	, ' ' as publication_code
    , ' ' as platform_type
    , ' ' as platform_type_name
    , col_1
    , col_2
    , col_3
    , col_4
    , col_5
    , col_6
    , col_7
    , col_8
    , col_9
    , col_10
    , col_11
    , col_12
    , sub_tot_sum
    , add_sale_price
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 2 as depth
    , movie_name as movie_name1
  from ( 
      select
          rdata.*
        , IFNULL((select sum(b.accounting_price) from accounting_summary a 
                  left join accounting_rawdata b
                  on a.accounting_summary_no = b.accounting_summary_no
                  		and b.use_yn = 'Y'
                  		and b.del_yn = 'N'
                  left join common_code c
                  on b.distribution_enterprise_type = c.type_code
                    and c.type_name = 'DISTRIBUTION_ENTERPRISE_TYPE'
                  where a.use_yn = 'Y'
                    and a.del_yn = 'N'
                    and a.status = 'C'
                    and a.accounting_type in ('B')
                    and b.movie_no = rdata.movie_no
					and a.settlement_date < concat(:st_date,'-01')
        	   ),0) as add_sale_price
      from (       
          select
              	  data.movie_no
              	, data.movie_name
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
              	, SUM(accounting_price) as sub_tot_sum
          from (
              select
                  a.movie_no
                , a.movie_name
                , a.service_open_date
                , a.platform_type
                , a.platform_type_name
                , b.settlement_date
                , ifnull(b.accounting_price, 0) as accounting_price
              from vw_pink_moive a left join (
                select
                	  b.movie_no
                	, a.settlement_date
                  , b.distribution_enterprise_type
                	, SUM(IFNULL(b.accounting_price,0)) as accounting_price
                  , c.parent_type_code as platform_type
                from accounting_summary a 
                left join accounting_rawdata b
                on a.accounting_summary_no = b.accounting_summary_no
                		and b.use_yn = 'Y'
                		and b.del_yn = 'N'
                left join common_code c
                on b.distribution_enterprise_type = c.type_code
                  and c.type_name = 'DISTRIBUTION_ENTERPRISE_TYPE'
                where a.use_yn = 'Y'
                  and a.del_yn = 'N'
                  and a.status = 'C'
                  and a.accounting_type in ('B')
                  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
                group by b.movie_no, a.settlement_date, b.distribution_enterprise_type
              ) b
              on a.movie_no = b.movie_no
                and a.platform_type = b.platform_type
				where 1=1
				{IN_STR1}
          ) data 
          group by data.movie_no
              	, data.movie_name
      ) rdata
  ) alldata
  union all
	select
		  0 as movie_no
		, '합계' as movie_name
		, ' ' as service_open_date
		, ' ' as publication_code
		, ' ' as platform_type
		, ' ' as platform_type_name
		, ifnull(col_1,0) as col_1
		, ifnull(col_2,0) as col_2
		, ifnull(col_3,0) as col_3
		, ifnull(col_4,0) as col_4
		, ifnull(col_5,0) as col_5
		, ifnull(col_6,0) as col_6
		, ifnull(col_7,0) as col_7
		, ifnull(col_8,0) as col_8
		, ifnull(col_9,0) as col_9
		, ifnull(col_10,0) as col_10
		, ifnull(col_11,0) as col_11
		, ifnull(col_12,0) as col_12
		, ifnull(sub_tot_sum,0) as sub_tot_sum
		, ifnull(add_sale_price,0) as add_sale_price
		, (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
		, 3 as depth
		, '황황황황황황황황황황황황황황황황황황' as movie_name1
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
					  and a.status = 'C'
					  and a.accounting_type in ('B')
					  and a.settlement_date < concat(:st_date,'-01')
					  {IN_STR}
      		   ),0) as add_sale_price
		from ( 
			select
            		  SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
            		, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
            		, SUM(accounting_price) as sub_tot_sum
			from (
				select
            		  a.settlement_date
				  , SUM(IFNULL(b.accounting_price,0)) as accounting_price
				from accounting_summary a 
				left join accounting_rawdata b
				on a.accounting_summary_no = b.accounting_summary_no
            			and b.use_yn = 'Y'
            			and b.del_yn = 'N'
				where a.use_yn = 'Y'
				  and a.del_yn = 'N'
				  and a.status = 'C'
				  and a.accounting_type in ('B')
				  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
				  {IN_STR}
				group by b.movie_no, a.settlement_date
			) data
		) rdata
	) alldata    
) talldata
order by movie_name1 asc, depth asc;

-- [GetRawSalesReport_bak20170825]
 select
*
from (
select
    alldata.*
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 1 as depth
  from (
    	select
      	  rdata.*
      	, m.movie_name
      	, m.service_open_date
        , IFNULL((select sum(b.accounting_price) from accounting_summary a 
          	left join accounting_rawdata b
          	on a.accounting_summary_no = b.accounting_summary_no
          	  and b.use_yn = 'Y'
          	  and b.del_yn = 'N'
          	where a.use_yn = 'Y'
          	  and a.del_yn = 'N'
          	  and a.settlement_date < concat(:st_date,'-01')
              and a.status = 'C'
			  and a.accounting_type in ('C')
              and b.movie_no = rdata.movie_no
			   {IN_STR}
			  ),0) as add_sale_price
      	from 
      	(
        	select
        	  data.movie_no
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        	, MAX(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        	, SUM(accounting_price) as sub_tot_sum
        	from(
        	select
        	  b.movie_no
        	, a.settlement_date
        	, sum(b.accounting_price) as accounting_price
        	from accounting_summary a 
        	left join accounting_rawdata b
        	on a.accounting_summary_no = b.accounting_summary_no
          		and b.use_yn = 'Y'
          		and b.del_yn = 'N'
        	where a.use_yn = 'Y'
        	  and a.del_yn = 'N'
			  and a.status = 'C'
			  and a.accounting_type in ('C')
        	  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
			   {IN_STR}
        	group by b.movie_no, a.settlement_date   
      	) data
      	group by data.movie_no
    	) rdata left join movie m on rdata.movie_no = m.movie_no
  ) alldata
union all
select
      0 as movie_no
    , IFNULL(col_1,0) as col_1
    , IFNULL(col_2,0) as col_2
    , IFNULL(col_3,0) as col_3
    , IFNULL(col_4,0) as col_4
    , IFNULL(col_5,0) as col_5
    , IFNULL(col_6,0) as col_6
    , IFNULL(col_7,0) as col_7
    , IFNULL(col_8,0) as col_8
    , IFNULL(col_9,0) as col_9
    , IFNULL(col_10,0) as col_10
    , IFNULL(col_11,0) as col_11
    , IFNULL(col_12,0) as col_12
    , IFNULL(sub_tot_sum,0) as sub_tot_sum
    , '합계' as movie_name
    , '-' as service_open_date
    , IFNULL(add_sale_price, 0) as add_sale_price
    , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    , 2 as depth
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
          	  and a.settlement_date < concat(:st_date,'-01')
              and a.status = 'C'
			  and a.accounting_type in ('C')
			   {IN_STR}
			  ),0) as add_sale_price
      	from  
      	(
        	select
        	  SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
        	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
        	, SUM(IFNULL(accounting_price,0)) as sub_tot_sum
        	from(
        	select
        	  b.movie_no
        	, a.settlement_date
        	, SUM(IFNULL(b.accounting_price,0)) as accounting_price
        	from accounting_summary a 
        	left join accounting_rawdata b
        	on a.accounting_summary_no = b.accounting_summary_no
          		and b.use_yn = 'Y'
          		and b.del_yn = 'N'
        	where a.use_yn = 'Y'
        	  and a.del_yn = 'N'
			  and a.status = 'C'
			  and a.accounting_type in ('C') /*법무법인*/
        	  and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
			  {IN_STR}
        	group by b.movie_no, a.settlement_date   
      	) data
    	) rdata
  ) alldata
) talldata
order by depth asc, movie_name asc
;

-- [GetYearList]
select 
  c_year 
from calendar
where c_year between '2013' and date_format(now(),'%Y')
group by c_year
order by c_year desc;

-- [GetCpCorpSalesReport]
select
*
from (
    select
        1 as depth
      , cp_corp_name as cp_corp_name1
      , alldata.*
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    from (
      select
          rdata.*
        , IFNULL((select sum(b.accounting_price) from accounting_summary a 
                	left join accounting_rawdata b
                	on a.accounting_summary_no = b.accounting_summary_no
                	  and b.use_yn = 'Y'
                	  and b.del_yn = 'N'
                  left join movie c
                  on b.movie_no = c.movie_no
                	where a.use_yn = 'Y'
                	  and a.del_yn = 'N'
                	  and a.settlement_date < concat(:st_date,'-01')
                    and a.status = 'C'
              	    and a.accounting_type in ('A','B','D')
                    and c.cp_corp_detail_no = rdata.cp_corp_detail_no
        	   ),0) as add_sale_price
      from (  
        select
            	  data.cp_corp_detail_no
            	, data.cp_corp_no
              , data.cp_corp_detail_name
              , data.cp_corp_name
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
            	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
            	, SUM(accounting_price) as sub_tot_sum
        from (
            select
               a.cp_corp_detail_no
             , a.cp_corp_no
             , a.cp_corp_detail_name
             , b.settlement_date
             , c.cp_corp_name
             , ifnull(b.accounting_price, 0) as accounting_price
            from cp_corp_detail a 
            left join 
            (
                select
                	  b.movie_no
                	, a.settlement_date
                	, sum(b.accounting_price) as accounting_price
                  , c.cp_corp_detail_no
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
                    and a.accounting_type in ('A','B','D')
                    and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
                  group by b.movie_no
                        , a.settlement_date
                        , c.cp_corp_detail_no
            ) b
            on a.cp_corp_detail_no = b.cp_corp_detail_no
            left join cp_corp c
            on a.cp_corp_no = c.cp_corp_no
			where 1=1
			{IN_STR}
        ) data 
         group by data.cp_corp_detail_no
            	, data.cp_corp_no
              , data.cp_corp_detail_name
              , data.cp_corp_name
      ) rdata   
    ) alldata 
    union all
    select
         2 as depth
      , cp_corp_name as cp_corp_name1
      ,  0 as cp_corp_detail_no
      ,  cp_corp_no
      , '총합계' as cp_corp_detail_name
      , ' ' as cp_corp_name
    	, ifnull(col_1,0) as col_1
    	, ifnull(col_2,0) as col_2
    	, ifnull(col_3,0) as col_3
    	, ifnull(col_4,0) as col_4
    	, ifnull(col_5,0) as col_5
    	, ifnull(col_6,0) as col_6
    	, ifnull(col_7,0) as col_7
    	, ifnull(col_8,0) as col_8
    	, ifnull(col_9,0) as col_9
    	, ifnull(col_10,0) as col_10
    	, ifnull(col_11,0) as col_11
    	, ifnull(col_12,0) as col_12
    	, ifnull(sub_tot_sum,0) as sub_tot_sum
    	, ifnull(add_sale_price,0) as add_sale_price
      , (ifnull(sub_tot_sum,0) + ifnull(add_sale_price, 0)) as total_sum
    from (
        select
            rdata.*
          , IFNULL((select sum(b.accounting_price) from accounting_summary a 
                  	left join accounting_rawdata b
                  	on a.accounting_summary_no = b.accounting_summary_no
                  	  and b.use_yn = 'Y'
                  	  and b.del_yn = 'N'
                    left join movie c
                    on b.movie_no = c.movie_no
                    left join cp_corp_detail d
                    on d.cp_corp_detail_no = c.cp_corp_detail_no
                  	where a.use_yn = 'Y'
                  	  and a.del_yn = 'N'
                  	  and a.settlement_date < concat(:st_date,'-01')
                      and a.status = 'C'
                	    and a.accounting_type in ('A','B','D')
                      and d.cp_corp_no = rdata.cp_corp_no
          	   ),0) as add_sale_price
        from (  
          select
              	  data.cp_corp_no
                , data.cp_corp_name
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-02'), accounting_price, 0)) AS col_2
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-03'), accounting_price, 0)) AS col_3
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-04'), accounting_price, 0)) AS col_4
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-05'), accounting_price, 0)) AS col_5
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-06'), accounting_price, 0)) AS col_6
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-07'), accounting_price, 0)) AS col_7
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-08'), accounting_price, 0)) AS col_8
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-09'), accounting_price, 0)) AS col_9
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-10'), accounting_price, 0)) AS col_10
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-11'), accounting_price, 0)) AS col_11
              	, SUM(IF(settlement_date = CONCAT(:st_date,'-12'), accounting_price, 0)) AS col_12
              	, SUM(accounting_price) as sub_tot_sum
          from (
              select
                 a.cp_corp_detail_no
               , a.cp_corp_no
               , a.cp_corp_detail_name
               , b.settlement_date
               , c.cp_corp_name
               , ifnull(b.accounting_price, 0) as accounting_price
              from cp_corp_detail a 
              left join 
              (
                  select
                  	  b.movie_no
                  	, a.settlement_date
                  	, sum(b.accounting_price) as accounting_price
                    , c.cp_corp_detail_no
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
                      and a.accounting_type in ('A','B','D')
                      and a.settlement_date between concat(:st_date,'-01') and concat(:st_date,'-12')
                    group by b.movie_no
                          , a.settlement_date
                          , c.cp_corp_detail_no
              ) b
              on a.cp_corp_detail_no = b.cp_corp_detail_no
              left join cp_corp c
              on a.cp_corp_no = c.cp_corp_no
			  where 1=1
				{IN_STR}
          ) data 
           group by data.cp_corp_no
                , data.cp_corp_name
        ) rdata   
    ) alldata     
) talldata
order by cp_corp_name1 asc, depth asc, cp_corp_detail_name asc;



-- [GetBillingPaperReport]
  select
       data.*
	 , ifnull(data.car_nk_pay_price,(case when data.cp_corp_detail_no = 30000 /*KT대행일경우 총매출*/ 
          then round((sales_price*replace(ifnull(nk_contract_rate,0),'%','') /100),2)  
          else round((accounting_price*replace(ifnull(nk_contract_rate,0),'%','') /100),2) end)) 
     as nk_pay_price
     , ifnull(data.car_cp_pay_price,(case when data.cp_corp_detail_no = 30000 /*KT대행일경우 총매출*/ 
          then round((sales_price*replace(ifnull(cp_contract_rate,0),'%','')/100),2) 
          else round((accounting_price*replace(ifnull(cp_contract_rate,0),'%','')/100),2) end))
     as cp_pay_price
     , (case when (select count(*) from cp_accounting_report a where use_yn='Y' and del_yn ='N'  and a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounting_report a where use_yn='Y' and del_yn ='N'  and a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
	 , ifnull(data.car_total_pay_price,(case when data.cp_corp_detail_no = 30000 /*KT대행일경우 총매출*/ 
	      then round((sales_price*replace(ifnull(total_sales,0),'%','') /100),2)  
	      else round((sales_price*replace(ifnull(total_sales,0),'%','') /100),2) end))
	 as total_pay_price
     , ifnull(data.car_nkk_pay_price,(case when data.cp_corp_detail_no = 30000 /*KT대행일경우 총매출*/ 
          then round((sales_price*replace(ifnull(nk_sales,0),'%','')/100),2) 
          else round((sales_price*replace(ifnull(nk_sales,0),'%','')/100),2) end)) 
     as nkk_pay_price
	 , 1 depth
 from(
    select
          a.settlement_date
        , ifnull((car.sales_price),(b.sales_price)) as sales_price
        , ifnull(max(car.accounting_rates),max(b.accounting_rates)) as accounting_rates
        , ifnull((car.accounting_price),(b.accounting_price)) as accounting_price
        , c.movie_no
        , c.movie_name
		, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no) movie_tag_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
		, ifnull(car.nk_sales,g.nk_sales) as nk_sales 
		, ifnull(car.cp_contract_rate,g.cp_contract_rate) as cp_contract_rate
		, ifnull(car.nk_contract_rate,g.nk_contract_rate) as nk_contract_rate 
		, car.nk_pay_price car_nk_pay_price
		, car.cp_pay_price car_cp_pay_price
		, car.total_pay_price car_total_pay_price
		, car.nkk_pay_price car_nkk_pay_price
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and b.movie_no=car.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
                , c.movie_no
				, c.movie_name
				, c.publication_code
				, d.sp_corp_detail_no
				, d.sp_corp_detail_name
				, e.sp_corp_no
				, e.sp_corp_name
				, f.cp_corp_no
				, f.cp_corp_name
				, g.cp_corp_detail_no
				, car.cp_corp_detail_no
				, car.sp_corp_detail_no
				, car.cp_corp_no
				, g.cp_corp_detail_name
				, g.nk_contract_rate
				, g.cp_contract_rate   
				, car.total_sales
				, car.nk_sales      
				, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no)
 ) data 
 union all
 select 
  '' settlement_date
        , null sales_price
        , null accounting_rates
        , null accounting_price
        , null movie_no
        , '선급이월액' movie_name
		, null movie_tag_name
        , null publication_code
        , null sp_corp_detail_no
        , null sp_corp_detail_name
        , null sp_corp_no
        , null sp_corp_name
        , cp_corp_no
        , null cp_corp_name
        , cp_corp_detail_no
        , null cp_corp_detail_name
		, null total_sales
        , null nk_sales  
		, null cp_contract_rate  
        , null nk_contract_rate
        , null car_nk_pay_price
        , null car_cp_pay_price
		, null car_total_pay_price
		, null car_nkk_pay_price
		, null nk_pay_price
		, null cp_pay_price
        , null cp_confirm_yn
        , format(ifnull(sum(settlement_amt),0)-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no 
		  and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N'),0) cp_confirm_yn_name
        , null total_pay_price
		, null nkk_pay_price
        , 9 depth
        from cp_pre_pay
        where cp_corp_detail_no = :cp_corp_detail_no
        and settlement_month <= :st_date
		and use_yn = 'Y'
		and del_yn = 'N'
        and pay_yn='Y'
 order by depth asc, cp_corp_detail_name asc, sp_corp_name asc, sp_corp_detail_name asc, movie_name asc
 ;


-- [GetAccountMailReportRawData]
select a.settlement_date, format((sales_price),0) as sales_price, format((total_pay_price),0) as cp_pay_price, 
  a.movie_no, b.movie_name , null publication_code, a.sp_corp_detail_no, c.sp_corp_detail_name
  , null sp_corp_no, null sp_corp_name
  , null cp_corp_no, null cp_corp_name, null cp_corp_detail_no
  , null cp_corp_detail_name
  , a.total_sales
  , null nk_sales
  , concat(format(CAST(ifnull(a.total_sales,a.total_sales) AS signed integer),0),'%') as cp_contract_rate
  , null cp_confirm_yn
  , null cp_confirm_yn_name
  , null carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
  from cp_accounting_report a
  left join movie b
  on a.movie_no = b.movie_no
  left join sp_corp_detail c
  on a.sp_corp_detail_no = c.sp_corp_detail_no
  where a.cp_corp_detail_no =:cp_corp_detail_no
  and a.settlement_date =:st_date
  and a.use_yn ='Y'
  and a.del_yn ='N'
  order by b.movie_name,c.sp_corp_detail_name  
;

-- [GetAccountMailReportRawData___________________]
  select
       data.*
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
 from(
    select
          a.settlement_date
		--  , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		--  , format(SUM(IF(report_no = '102', car.accounting_price, b.sales_price)),0) as sales_price
		--, format(SUM(IF(:report_no = '102', car.accounting_price, b.sales_price)),0) as sales_price
		 , format(CAST(ifnull(sum(b.sales_price),sum(b.sales_price)) AS signed integer),0) as sales_price
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
        , ifnull(car.nk_sales,g.nk_sales) as nk_sales 
		, concat(format(CAST(ifnull(car.total_sales,car.cp_contract_rate) AS signed integer),0),'%') as cp_contract_rate
		, format(CAST(ifnull(car.total_pay_price,car.cp_pay_price) AS signed integer),0) as cp_pay_price
		, car.nk_pay_price car_nk_pay_price
		, car.cp_pay_price car_cp_pay_price
		, car.total_pay_price car_total_pay_price
		, car.nkk_pay_price car_nkk_pay_price
		, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no) mail_no
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and car.movie_no=c.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
        , g.nk_contract_rate
        , g.cp_contract_rate    
	    , car.total_sales
        , car.nk_sales
		, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no)
 ) data 
 order by movie_name asc, cp_corp_detail_name asc, sp_corp_name asc
 ;

-- [GetAccountMailReportRawDataRT02]
select a.settlement_date, format((accounting_price),0) as sales_price
  , a.movie_no, b.movie_name , null publication_code, a.sp_corp_detail_no, c.sp_corp_detail_name
  , null sp_corp_no, null sp_corp_name
  , null cp_corp_no, null cp_corp_name, null cp_corp_detail_no
  , null cp_corp_detail_name
  , a.total_sales
  , null nk_sales
  , concat(format(CAST(ifnull(a.cp_contract_rate,a.cp_contract_rate) AS signed integer),0),'%') as cp_contract_rate
  , format((cp_pay_price),0) as cp_pay_price
  , null car_nk_pay_price
  , null car_cp_pay_price
  , null car_total_pay_price
  , null car_nkk_pay_price
  , null cp_confirm_yn
  , null cp_confirm_yn_name
  from cp_accounting_report a
  left join movie b
  on a.movie_no = b.movie_no
  left join sp_corp_detail c
  on a.sp_corp_detail_no = c.sp_corp_detail_no
  where a.cp_corp_detail_no =:cp_corp_detail_no
  and a.settlement_date =:st_date
  and a.use_yn ='Y'
  and a.del_yn ='N'
  order by b.movie_name,c.sp_corp_detail_name  
;
-- [GetAccountMailReportRawDataRT02________________]
  select
       data.*
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
 from(
    select
          a.settlement_date
		--  , SUM(IF(settlement_date = CONCAT(:st_date,'-01'), accounting_price, 0)) AS col_1
		--  , format(SUM(IF(report_no = '102', car.accounting_price, b.sales_price)),0) as sales_price
		--, format(SUM(IF(:report_no = '102', car.accounting_price, b.sales_price)),0) as sales_price
		 , format(CAST(ifnull((car.accounting_price),(car.accounting_price)) AS signed integer),0) as sales_price
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
        , ifnull(car.nk_sales,g.nk_sales) as nk_sales 
		, concat(format(CAST(ifnull(car.total_sales,car.cp_contract_rate) AS signed integer),0),'%') as cp_contract_rate
		, format(CAST(ifnull(car.total_pay_price,car.cp_pay_price) AS signed integer),0) as cp_pay_price
		, car.nk_pay_price car_nk_pay_price
		, car.cp_pay_price car_cp_pay_price
		, car.total_pay_price car_total_pay_price
		, car.nkk_pay_price car_nkk_pay_price
		, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no)
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and car.movie_no=c.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
        , g.nk_contract_rate
        , g.cp_contract_rate    
	    , car.total_sales
        , car.nk_sales   
		, ifnull(car.cp_accounting_report_no,b.accounting_rawdata_no)
 ) data 
 order by movie_name asc, cp_corp_detail_name asc, sp_corp_name asc
 ;


-- [GetAccountMailReport]
select null settlement_date, format(sum(sales_price),0) as sales_price, format(sum(total_pay_price),0) as cp_pay_price, 
  a.movie_no, b.movie_name , null publication_code, null sp_corp_detail_no, 'test' sp_corp_detail_name
  ,b.movie_name movie_name2, null sp_corp_no, null sp_corp_name
  , null cp_corp_no, null cp_corp_name, null cp_corp_detail_no
  , null cp_corp_detail_name
  , a.total_sales
  , a.total_sales nk_sales
  , a.total_sales cp_contract_rate
  , null cp_confirm_yn
  , null cp_confirm_yn_name
  , ((select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no
 	   and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='Y')-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no
 	   and settlement_month < :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N')) carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
  from cp_accounting_report a
  left join movie b
  on a.movie_no = b.movie_no
  where a.cp_corp_detail_no =:cp_corp_detail_no
  and a.settlement_date =:st_date
  and a.use_yn ='Y'
  and a.del_yn ='N'
  group by b.movie_name 
;

-- [GetAccountMailReport_bak20240129]
select null settlement_date, format(sum(alldata.sales_price),0) as sales_price, format(sum(alldata.cp_pay_price),0) as cp_pay_price
 ,alldata.movie_no, alldata.movie_name, alldata.publication_code, alldata.sp_corp_detail_no , alldata.sp_corp_detail_name, alldata.movie_name2, alldata.sp_corp_no, alldata.sp_corp_name
 ,alldata.cp_corp_no, alldata.cp_corp_name, alldata.cp_corp_detail_no
 , alldata.cp_corp_detail_name
 , alldata.total_sales
 , alldata.nk_sales
 , alldata.cp_contract_rate
 , alldata.cp_confirm_yn
 , alldata.cp_confirm_yn_name
 , alldata.carryover_amt, alldata.max_rate, alldata.min_rate, alldata.cp_max_rate, alldata.nk_min_rate
from (
select
       data.*
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
     , ((select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='Y')-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month < :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N')) carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
 from(
    select
          a.settlement_date
		--, format(CAST(ifnull(sum(b.sales_price),sum(car.accounting_price)) AS signed integer),0) as sales_price
		, ifnull(sum(b.sales_price),0) sales_price
        , c.movie_no
        , c.movie_name movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , c.movie_name movie_name2
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
        , ifnull(car.nk_sales,g.nk_sales) as nk_sales 
		, concat(format(CAST(ifnull(car.total_sales,car.cp_contract_rate) AS signed integer),0),'%') as cp_contract_rate
		, ifnull(round(car.total_pay_price),round(car.cp_pay_price)) as cp_pay_price
		, car.nk_pay_price car_nk_pay_price
		, car.cp_pay_price car_cp_pay_price
		, car.total_pay_price car_total_pay_price
		, car.nkk_pay_price car_nkk_pay_price
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and car.movie_no=c.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , car.cp_corp_detail_no
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , g.cp_corp_detail_name
        , g.nk_contract_rate
        , g.cp_contract_rate     
		, car.total_sales
        , car.nk_sales      
 ) data 
 ) alldata
 group by alldata.settlement_date
        , alldata.movie_no
        , alldata.movie_name2
        ,alldata.publication_code
        , alldata.cp_corp_no
        , alldata.cp_corp_name 
  order by movie_name2 asc
  ;

-- [GetAccountMailReportRT02]
select null settlement_date, format(sum(accounting_price),0) as sales_price, format(sum(cp_pay_price),0) as cp_pay_price, 
  a.movie_no, b.movie_name , null publication_code, a.sp_corp_detail_no, c.sp_corp_detail_name
  ,b.movie_name movie_name2, null sp_corp_no, null sp_corp_name
  , null cp_corp_no, null cp_corp_name, null cp_corp_detail_no
  , null cp_corp_detail_name
  , a.total_sales
  , a.total_sales nk_sales
  , concat(a.cp_contract_rate,'%') cp_contract_rate
  , null cp_confirm_yn
  , null cp_confirm_yn_name
  , ((select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no
 	   and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='Y')-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no
 	   and settlement_month < :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N')) carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
  from cp_accounting_report a
  left join movie b
  on a.movie_no = b.movie_no
  left join sp_corp_detail c
  on a.sp_corp_detail_no = c.sp_corp_detail_no
  where a.cp_corp_detail_no =:cp_corp_detail_no
  and a.settlement_date =:st_date
  and a.use_yn ='Y'
  and a.del_yn ='N'
  group by b.movie_name 
;


-- [GetAccountMailReportRT02____________________________________]
select null settlement_date, format(sum(alldata.sales_price),0) as sales_price, format(sum(alldata.cp_pay_price),0) as cp_pay_price
 ,alldata.movie_no, alldata.movie_name, alldata.publication_code, alldata.sp_corp_detail_no , alldata.sp_corp_detail_name, alldata.movie_name2, alldata.sp_corp_no, alldata.sp_corp_name
 ,alldata.cp_corp_no, alldata.cp_corp_name, alldata.cp_corp_detail_no
 , alldata.cp_corp_detail_name
 , alldata.total_sales
 , alldata.nk_sales
 , alldata.cp_contract_rate
 , alldata.cp_confirm_yn
 , alldata.cp_confirm_yn_name
 , alldata.carryover_amt, alldata.max_rate, alldata.min_rate, alldata.cp_max_rate, alldata.nk_min_rate
from (
select
       data.*
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
     , ((select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='Y')-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month < :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N')) carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
 from(
    select
          a.settlement_date
		--, format(CAST(ifnull(sum(b.sales_price),sum(car.accounting_price)) AS signed integer),0) as sales_price
		, ifnull((car.accounting_price),0) sales_price
        , c.movie_no
        , 1 as movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , c.movie_name movie_name2
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
        , ifnull(car.nk_sales,g.nk_sales) as nk_sales 
		, concat(format(CAST(ifnull(car.cp_contract_rate,car.total_sales) AS signed integer),0),'%') as cp_contract_rate
 		, ifnull(round(car.total_pay_price),round(car.cp_pay_price)) as cp_pay_price
		, car.nk_pay_price car_nk_pay_price
		, car.cp_pay_price car_cp_pay_price
		, car.total_pay_price car_total_pay_price
		, car.nkk_pay_price car_nkk_pay_price
		, car.cp_accounting_report_no
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and car.movie_no=c.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , car.cp_corp_detail_no
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
        , e.sp_corp_no
        , e.sp_corp_name
        , g.cp_corp_detail_name
        , g.nk_contract_rate
        , g.cp_contract_rate     
		, car.total_sales
        , car.nk_sales
		, car.cp_accounting_report_no
 ) data 
 ) alldata
 group by alldata.settlement_date
        , alldata.movie_no
        , alldata.movie_name2
        ,alldata.publication_code
        , alldata.cp_corp_no
        , alldata.cp_corp_name 
  order by movie_name2 asc
  ;

-- [GetAccountMailReport_back20240123]
select
       data.*
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then 'N' else 'Y' end) as cp_confirm_yn
     , (case when (select count(*) from cp_accounts_end_info a where a.settlement_date = :st_date and a.cp_corp_detail_no = :cp_corp_detail_no) = 0 then '마감전' else '마감완료' end) as cp_confirm_yn_name
 	 , ((select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month <= :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='Y')-(select ifnull(sum(settlement_amt),0) from cp_pre_pay where cp_corp_detail_no = :cp_corp_detail_no  
 	   and settlement_month < :st_date and use_yn = 'Y' and del_yn = 'N' and pay_yn='N')) carryover_amt
	 ,(select max(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) max_rate
 	 ,(select min(total_sales)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) min_rate
	 ,(select max(cp_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) cp_max_rate
 	 ,(select min(nk_contract_rate)  from cp_corp_detail ccd where cp_corp_no = :cp_corp_no) nk_min_rate
 from(
    select
          null settlement_date
		, format(CAST(ifnull(sum(b.sales_price),sum(b.accounting_price)) AS signed integer),0) as sales_price
		, format(CAST(ifnull(sum(car.cp_pay_price),sum(car.total_pay_price)) AS signed integer),0) as cp_pay_price
        , c.movie_no
        , row_number() over(order by c.movie_name asc) as movie_name
        , c.publication_code
        , d.sp_corp_detail_no
        , d.sp_corp_detail_name
		, c.movie_name movie_name2
        , e.sp_corp_no
        , e.sp_corp_name
        , f.cp_corp_no
        , f.cp_corp_name
        , g.cp_corp_detail_no
        , g.cp_corp_detail_name
		, ifnull(car.total_sales,g.total_sales) as total_sales
        , ifnull(car.nk_sales,g.nk_sales) as nk_sales 
        , concat(ifnull(car.total_sales,car.cp_contract_rate),'%') as cp_contract_rate
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
      and b.use_yn = 'Y'
      and b.del_yn = 'N'
    left join movie c
    on b.movie_no = c.movie_no
    left join sp_corp_detail d
    on b.sp_corp_detail_no = d.sp_corp_detail_no
    left join sp_corp e
    on d.sp_corp_no = e.sp_corp_no
    left join cp_corp f
    on c.cp_corp_no = f.cp_corp_no
    left join cp_corp_detail g
    on f.cp_corp_no = g.cp_corp_no
	left join cp_accounting_report car
    on f.cp_corp_no = car.cp_corp_no
    and g.cp_corp_detail_no = car.cp_corp_detail_no
    and a.settlement_date=car.settlement_date
    and car.sp_corp_detail_no=b.sp_corp_detail_no
	and car.movie_no=c.movie_no
    and car.use_yn = 'Y'
    and car.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('A','B','D')
      and a.settlement_date = :st_date
      and b.sp_corp_detail_no in (select 
                                    b.sp_corp_detail_no 
                                  from cp_to_sp_corp_group a 
                                  left join sp_corp_detail b 
                                  on a.sp_corp_no = b.sp_corp_no 
                                    and b.use_yn = 'Y' 
                                    and b.del_yn = 'N' 
                                  where a.cp_corp_detail_no = :cp_corp_detail_no)
      and g.cp_corp_detail_no = :cp_corp_detail_no
    group by a.settlement_date
        , c.movie_no
        , c.movie_name
        , c.publication_code
        , car.cp_corp_detail_no
        , g.cp_corp_detail_name
        , g.nk_contract_rate
        , g.cp_contract_rate     
		, car.total_sales
        , car.nk_sales     
 ) data 
 order by movie_name asc
 ;


-- [GetBillingPaperReport_bak20170830]
select
  data.*
  , (accounting_price*replace(ifnull(nk_contract_rate,0),'%','') /100) as nk_pay_price
  , (accounting_price*replace(ifnull(cp_contract_rate,0),'%','')/100) as cp_pay_price
from (  
    select
        a.cp_corp_detail_no
      , a.cp_corp_no
      , a.cp_corp_detail_name
      , a.nk_contract_rate
      , a.cp_contract_rate
      , b.movie_no
      , b.settlement_date
      , ifnull(b.sales_price,0) as sales_price
      , ifnull(b.accounting_rates,0) as accounting_rates
      , ifnull(b.accounting_price,0) as accounting_price
      , b.movie_name
      , c.cp_corp_name
    from cp_corp_detail a
    left join (
        select
            b.movie_no
          , a.settlement_date
          , sum(b.sales_price) as sales_price
          , max(b.accounting_rates) as accounting_rates
          , sum(b.accounting_price) as accounting_price 
          , c.movie_name
          , c.cp_corp_detail_no
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
          and a.accounting_type in ('A','B','D')
          and a.settlement_date between concat(:st_date) and concat(:st_date)
        group by b.movie_no
              , a.settlement_date
              , c.movie_name
              , c.cp_corp_detail_no
    ) b
    on a.cp_corp_detail_no = b.cp_corp_detail_no
    left join cp_corp c
    on a.cp_corp_no = c.cp_corp_no
	where 1=1
	{IN_STR}
) data
where accounting_price>0
order by cp_corp_name asc, cp_corp_detail_name asc;
 
 --[GetRawBillingPaperReport]
 select
 *
 from (
   select
      b.movie_no
    , b.sp_cor_accounting_date
	, ifnull(b.raw_nk_price,0) as raw_nk_price
	, ifnull(b.raw_monitor_price,0) as raw_monitor_price
	, ifnull(b.raw_price,0) as raw_price
	, ifnull(b.accounting_price,0) as accounting_price
	, c.movie_name
	, '1' as depth
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
    and a.accounting_type in ('C')
    and b.sp_cor_accounting_date between concat(:st_date) and concat(:ed_date)
	{IN_STR}
  union all  
  select
      '' as movie_no
    , '' as sp_cor_accounting_date
	, ifnull(sum(b.raw_nk_price),0) as raw_nk_price
	, ifnull(sum(b.raw_monitor_price),0) as raw_monitor_price
	, ifnull(sum(b.raw_price),0) as raw_price
	, ifnull(sum(b.accounting_price),0) as accounting_price
	, '합계' as movie_name
  , '2' as depth
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
    and a.accounting_type in ('C')
    and b.sp_cor_accounting_date between concat(:st_date) and concat(:ed_date)
	{IN_STR}
) data
order by depth asc, movie_name asc
;

-- [GetRawBillingPaperReport_bak20170914]
  select
      b.movie_no
    , b.sp_cor_accounting_date
	, ifnull(b.raw_nk_price,0) as raw_nk_price
	, ifnull(b.raw_monitor_price,0) as raw_monitor_price
	, ifnull(b.raw_price,0) as raw_price
	, ifnull(b.accounting_price,0) as accounting_price
	, c.movie_name
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
    and a.accounting_type in ('C')
    and b.sp_cor_accounting_date between concat(:st_date) and concat(:ed_date)
	{IN_STR}
order by c.movie_name asc
;

-- [GetRawBillingPaperReport_bak20170901]
select
  data.*
  , (ifnull(accounting_price,0)*0.4) as nk_buy
  , (ifnull(accounting_price,0)*0.25) as monitor_buy
  , (ifnull(accounting_price,0)*0.35) as raw_buy
from (
  select
      b.movie_no
    , b.sp_cor_accounting_date
    , sum(b.sales_price) as sales_price
    , max(b.accounting_rates) as accounting_rates
    , sum(b.accounting_price) as accounting_price 
    , c.movie_name
    , c.cp_corp_detail_no
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
    and a.accounting_type in ('C')
    and b.sp_cor_accounting_date between concat(:st_date) and concat(:ed_date)
	{IN_STR}
  group by b.movie_no
        , b.sp_cor_accounting_date
        , c.movie_name
        , c.cp_corp_detail_no 
) data 
;