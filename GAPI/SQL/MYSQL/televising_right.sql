-- [GetList]
select
	data.*,
	fn_get_common_type_data('TELEVISING_RIGHT_MOVIE_GUBUN', data.sales_gubun) as sales_gubun_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select
    a.televising_right_no
  , a.movie_no
  , a.sp_corp_name
  , a.sales_gubun
  , a.sales_st_date
  , a.sales_ed_date
  , a.sales_period
  , a.sales_price
  , a.gubun
  , a.remark
  , a.use_yn
  , a.del_yn
  , a.insert_user_no
  , a.insert_date
  , a.update_user_no
  , a.update_date
  , a.delete_user_no
  , a.delete_date
  , b.movie_name
  , b.publication_ed_date
  , (select count(*) from televising_right a where 1=1 and a.del_yn='N' {IN_STR}) as total_count
from televising_right a left join movie b
on a.movie_no = b.movie_no
where 1=1
  and a.use_yn = 'Y'
  and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetMyMovieComboList]
select distinct
	  c.movie_no
	, c.movie_name
	, c.publication_ed_date
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
 where a.use_yn = 'Y'
 and a.del_yn = 'N'
 and c.use_yn  = 'Y'
 and c.del_yn = 'N'
 and g.cp_corp_detail_no = :cp_corp_detail_no
order by movie_name asc
; 


-- [GetMovieComboList]
select
	  movie_no
	, movie_name
	, publication_ed_date
from movie
where ( movie_gubun in('A','C') or cp_corp_no in (1,7))
  and use_yn = 'Y'
  and del_yn = 'N'
order by movie_name asc; 

-- [Insert]
insert into televising_right(
	  televising_right_no
	, movie_no
	, sp_corp_name
	, sales_gubun
	, sales_st_date
	, sales_ed_date
	, sales_period
	, sales_price
	, gubun
	, remark
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :televising_right_no
	, :movie_no
	, :sp_corp_name
	, :sales_gubun
	, :sales_st_date
	, :sales_ed_date
	, :sales_period
	, :sales_price
	, :gubun
	, :remark
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update televising_right set
	  movie_no	= :movie_no              
	, sp_corp_name	= :sp_corp_name          
	, sales_gubun	= :sales_gubun           
	, sales_st_date	= :sales_st_date         
	, sales_ed_date	= :sales_ed_date         
	, sales_period	= :sales_period          
	, sales_price	= :sales_price           
	, gubun		= :gubun                 
	, remark	= :remark                
	, update_user_no= :oper_user_no          
	, update_date	= current_timestamp 
where televising_right_no = :televising_right_no
;

-- [Delete]
update televising_right set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where televising_right_no = :televising_right_no
;