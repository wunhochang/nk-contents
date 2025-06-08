-- [GetList]
select
	data.*,
	fn_get_common_type_data('MOVIE_GUBUN', data.movie_gubun) as movie_gubun_name,
	fn_get_common_type_data('MOVIE_SERVICE_TYPE', data.service_type) as service_type_name,
	FN_GET_CP_CORP_NAME(data.cp_corp_no) as cp_corp_no_name,
	FN_GET_CP_CORP_DETAIL_NAME(data.cp_corp_detail_no) as cp_corp_detail_no_name,
	FN_GET_SP_CORP_NAME(data.sp_corp_no) as sp_corp_no_name,
	fn_get_common_type_data('FLAG_TRUE_FALSE', data.pink_movie_yn) as pink_movie_yn_name,
	fn_get_common_type_data('FLAG_TRUE_FALSE', data.mg_yn) as mg_yn_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  movie_no
	, cp_corp_no
	, cp_corp_detail_no
	, sp_corp_no
	, movie_name
	, movie_gubun
	, service_type
	, publication_kind
	, publication_kind_name
	, publication_st_date
	, publication_ed_date
	, service_open_date
	, double_feature_date
	, first_open_date
	, premium_open_date
	, first_new_open_date
	, new_open_date
	, old_open_date
	, pink_movie_yn
	--, (case when pink_movie_yn='Y' then 'on' else '' end) as pink_movie_yn 
	, mg_price
	--, (case when mg_yn='Y' then 'on' else '' end) as mg_yn
	, mg_yn
	, publication_code
	, use_yn
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
	, (select count(*) from movie where 1=1 and del_yn='N' {IN_STR}) as total_count
from movie
where 1=1 and del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select
	  movie_no
	, movie_name
	, movie_name movie_rename
	, movie_gubun
	, service_type
	, publication_kind
	, publication_kind_name
	, publication_st_date
	, publication_ed_date
	, service_open_date
	, double_feature_date
	, first_open_date
	, premium_open_date
	, first_new_open_date
	, new_open_date
	, old_open_date
	, pink_movie_yn
	, mg_price
	, mg_yn
	, publication_code
from movie
where 1=1 
	and del_yn = 'N' 
	and use_yn = 'Y'
order by movie_name asc 
;


-- [GetComboList2]
select
	  movie_no
	, cp_corp_no
	, cp_corp_detail_no
	, sp_corp_no
	, movie_name
	, movie_name movie_rename
	, movie_gubun
	, service_type
	, publication_kind
	, publication_kind_name
	, publication_st_date
	, publication_ed_date
	, service_open_date
	, double_feature_date
	, first_open_date
	, premium_open_date
	, first_new_open_date
	, new_open_date
	, old_open_date
	, pink_movie_yn
	, mg_price
	, mg_yn
	, publication_code
from movie
where 1=1 
	and del_yn = 'N' 
	and use_yn = 'Y'
order by movie_name asc 
;

-- [Insert]
insert into movie(
	  movie_no
	, cp_corp_no
	, cp_corp_detail_no
	, sp_corp_no
	, movie_name
	, movie_gubun
	, service_type
	, publication_kind
	, publication_kind_name
	, publication_st_date
	, publication_ed_date
	, service_open_date
	, double_feature_date
	, first_open_date
	, premium_open_date
	, first_new_open_date
	, new_open_date
	, old_open_date
	, pink_movie_yn
	, mg_price
	, mg_yn
	, publication_code
	, use_yn
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :movie_no
	, (case when :cp_corp_no = 0 then null else :cp_corp_no end)
	, (case when :cp_corp_detail_no = 0 then null else :cp_corp_detail_no end)
	, (case when :sp_corp_no = 0 then null else :sp_corp_no end)
	, :movie_name
	, :movie_gubun
	, :service_type
	, :publication_kind
	, :publication_kind_name
	, :publication_st_date
	, :publication_ed_date
	, :service_open_date
	, :double_feature_date
	, :first_open_date
	, :premium_open_date
	, :first_new_open_date
	, :new_open_date
	, :old_open_date
	, :pink_movie_yn
	, :mg_price
	, :mg_yn
	, :publication_code
	, :use_yn
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update movie set
	  cp_corp_no			= (case when :cp_corp_no = 0 then null else :cp_corp_no end)
	, cp_corp_detail_no		= (case when :cp_corp_detail_no = 0 then null else :cp_corp_detail_no end)
	, sp_corp_no			= (case when :sp_corp_no = 0 then null else :sp_corp_no end)
	, movie_name			= :movie_name                    
	, movie_gubun			= :movie_gubun                   
	, service_type			= :service_type                  
	, publication_kind		= :publication_kind              
	, publication_kind_name	= :publication_kind_name         
	, publication_st_date	= :publication_st_date           
	, publication_ed_date	= :publication_ed_date           
	, service_open_date		= :service_open_date             
	, double_feature_date	= :double_feature_date           
	, first_open_date		= :first_open_date               
	, premium_open_date		= :premium_open_date             
	, first_new_open_date	= :first_new_open_date           
	, new_open_date			= :new_open_date                 
	, old_open_date			= :old_open_date                 
	, pink_movie_yn			= :pink_movie_yn                 
	, mg_price				= :mg_price                      
	, mg_yn					= :mg_yn                         
	, publication_code		= :publication_code           
	, use_yn				= :use_yn                   
	, update_date			= current_timestamp         
	, update_user_no		= :oper_user_no    
where movie_no = :movie_no
;

-- [Delete]
update movie set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where movie_no = :movie_no
;