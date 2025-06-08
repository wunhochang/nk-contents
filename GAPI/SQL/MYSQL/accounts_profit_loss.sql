-- [GetList]
select
  rrdata.*
, ( total_sales_price - total_price )as profit_loss_price
, (case when total_sales_price = 0 then
       '-100%'
       else
       concat(round( (total_sales_price - total_price)/total_price*100,0),'%')
   end) as profit_loss_rate
from (
	select
	     rdata.*
	  , (addition_publication_price+raw_price+theater_price+etc_price) as total_sales_price
	from (
	select
		  data.*
		, (case when data.service_open_date = null then '' else left(data.service_open_date,4) end) as service_open_date_year
		, fn_get_common_type_data('PROFIT_LOSS_MOVIE_GUBUN', data.movie_gubun) as movie_gubun_name
		, fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name
		, fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
	from(
		select
			  a.accounts_profit_loss_no
			, a.movie_no
			, a.movie_gubun
			, a.total_price
			, a.theater_price
			, a.etc_price
			, a.use_yn
			, a.del_yn
			, a.insert_user_no
			, a.insert_date
			, a.update_user_no
			, a.update_date
			, b.movie_name
			, b.service_open_date
			, (select count(*) from accounts_profit_loss b
				where 1=1
					and b.del_yn = 'N'
					{IN_STR}) as total_count
        -- , ifnull(c.accounting_price,0) as addition_publication_price
		,(select ifnull(sum(accounting_price),0) from vw_g_accounting_sales where movie_no=a.movie_no  and settlement_date<=:st_date) addition_publication_price
        , ifnull(d.accounting_price,0) as raw_price
  		from accounts_profit_loss a
  		left join movie b
  		on a.movie_no = b.movie_no
      left join vw_g_accounting_sales c
      on a.movie_no = c.movie_no   and c.settlement_date = :st_date
      left join vw_r_accounting_sales d
      on a.movie_no = d.movie_no
      where a.use_yn = 'Y'
  		  and a.del_yn = 'N'
		  
		  {IN_STR}
	) data
) rdata
) rrdata
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetList_bak20171024]
select
  rrdata.*
, ( total_sales_price - total_price )as profit_loss_price
, (case when total_sales_price = 0 then
       '-100%'
       else
       concat(round( (total_sales_price - total_price)/total_price*100,0),'%')
   end) as profit_loss_rate
from (
	select
	     rdata.*
	  , (addition_publication_price+raw_price+theater_price+etc_price) as total_sales_price
	from (
	select
		  data.*
		, (case when data.service_open_date = null then '' else left(data.service_open_date,4) end) as service_open_date_year
		, fn_get_common_type_data('PROFIT_LOSS_MOVIE_GUBUN', data.movie_gubun) as movie_gubun_name
		, fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name
		, fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
		, FN_GET_ADD_ACCOUNTING_PRICE('A', data.movie_no) as addition_publication_price
		, FN_GET_ADD_ACCOUNTING_PRICE('B', data.movie_no) as raw_price
	from(
		select
			  a.accounts_profit_loss_no
			, a.movie_no
			, a.movie_gubun
			, a.total_price
			, a.theater_price
			, a.etc_price
			, a.use_yn
			, a.del_yn
			, a.insert_user_no
			, a.insert_date
			, a.update_user_no
			, a.update_date
			, b.movie_name
			, b.service_open_date
			, (select count(*) from accounts_profit_loss b
				where 1=1
					and b.del_yn = 'N'
					{IN_STR}) as total_count
		from accounts_profit_loss a
		left join movie b
		on a.movie_no = b.movie_no
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
		  {IN_STR}
	) data
) rdata
) rrdata
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetList_bak20170915]
select
rdata.*
, (total_sales_price - total_price )as profit_loss_price
, (case when total_sales_price = 0 then
       '-100%'
       else
       concat(round((total_sales_price - total_price )/total_sales_price*100,0),'%')
   end) as profit_loss_rate
from (
select
  data.*
  , (addition_publication_price+raw_price+theater_price+etc_price) as total_sales_price
from (
		select
			  a.accounts_profit_loss_no
			, a.movie_no
			/*, a.settlement_date*/
			, a.movie_gubun
			, a.total_price
			/*, a.addition_publication_price
			, a.raw_price*/
			, a.theater_price
			, a.etc_price
			/*
			, a.total_sales_price
			, a.profit_loss_rate
			, a.profit_loss_price
			*/
			, a.use_yn
			, a.del_yn
			, a.insert_user_no
			, a.insert_date
			, a.update_user_no
			, a.update_date
			, b.movie_name
			, b.service_open_date
			, (case when b.service_open_date = null then '' else left(b.service_open_date,4) end) as service_open_date_year
			, fn_get_common_type_data('PROFIT_LOSS_MOVIE_GUBUN', a.movie_gubun) as movie_gubun_name
			, fn_get_user_name_by_no(a.insert_user_no) as insert_user_no_name
			, fn_get_user_name_by_no(a.update_user_no) as update_user_no_name
			, FN_GET_ADD_ACCOUNTING_PRICE('A', b.movie_no) as addition_publication_price
			, FN_GET_ADD_ACCOUNTING_PRICE('B', b.movie_no) as raw_price
		from accounts_profit_loss a
		left join movie b
		on a.movie_no = b.movie_no
		where a.use_yn = 'Y'
		  and a.del_yn = 'N'
	) data
) rdata
order by movie_name asc
;

-- [GetMovieRawPrice]
select
  ifnull(sum(b.accounting_price),0) as addition_publication_price
  , ifnull((
    select
      ifnull(sum(b.accounting_price),0) as addition_publication_price
    from accounting_summary a
    left join accounting_rawdata b
    on a.accounting_summary_no = b.accounting_summary_no
    		and b.use_yn = 'Y'
    		and b.del_yn = 'N'
    where a.use_yn = 'Y'
      and a.del_yn = 'N'
      and a.status = 'C'
      and a.accounting_type in ('C')
      and b.movie_no = :movie_no
      and a.settlement_date <= concat(:settlement_date)
  ),0) as raw_price
from accounting_summary a
left join accounting_rawdata b
on a.accounting_summary_no = b.accounting_summary_no
		and b.use_yn = 'Y'
		and b.del_yn = 'N'
where a.use_yn = 'Y'
  and a.del_yn = 'N'
  and a.status = 'C'
  and a.accounting_type in ('A','B','D')
  and b.movie_no = :movie_no
  and a.settlement_date <= concat(:settlement_date)
  ;



-- [Insert]
insert into accounts_profit_loss(
	  accounts_profit_loss_no
	, movie_no
	, movie_gubun
	, total_price
	, theater_price
	, etc_price
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :accounts_profit_loss_no
	, :movie_no
	, :movie_gubun
	, :total_price
	, :theater_price
	, :etc_price
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update accounts_profit_loss set
	  movie_no				= :movie_no
	, movie_gubun			= :movie_gubun
	, total_price			= :total_price
	, theater_price			= :theater_price
	, etc_price				= :etc_price
	, update_user_no		= :oper_user_no
	, update_date			= current_timestamp
where accounts_profit_loss_no = :accounts_profit_loss_no
;

-- [Delete]
update accounts_profit_loss set
	  use_yn		= 'N'
	, del_yn		= 'Y'
	, delete_user_no	= :oper_user_no
	, delete_date		= current_timestamp
where accounts_profit_loss_no = :accounts_profit_loss_no
;
