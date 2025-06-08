-- [GetList]
select
	data.*,
	fn_get_common_type_data('MOVIE_GUBUN', data.movie_gubun) as movie_gubun_name,
	fn_get_common_type_data('MOVIE_SERVICE_TYPE', data.service_type) as service_type_name,
	FN_GET_CP_CORP_NAME(data.cp_corp_no) as cp_corp_no_name,

	fn_get_common_type_data('FLAG_TRUE_FALSE', data.pink_movie_yn) as pink_movie_yn_name,
	fn_get_common_type_data('FLAG_TRUE_FALSE', data.mg_yn) as mg_yn_name,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  a.movie_no
	, a.cp_corp_no
	, a.movie_name
	, a.movie_gubun
	, a.service_type
	, a.publication_kind
	, a.publication_kind_name
	, a.publication_st_date
	, a.publication_ed_date
	, concat(Ceil(IFNULL(DATEDIFF(a.publication_ed_date, a.publication_st_date),0)/365),'년') as date_period 
	, a.service_open_date
	, a.double_feature_date
	, a.first_open_date
	, a.premium_open_date
	, a.first_new_open_date
	, a.new_open_date
	, a.old_open_date
	, a.pink_movie_yn
	, a.mg_price
	, a.mg_yn
	, a.publication_code
	, a.use_yn
	, a.insert_date
	, a.insert_user_no
	, a.update_date
	, a.update_user_no
	, b.movie_publiction_info_no
	, b.theater_yn
	, b.cabletv_yn
	, b.ground_wave_yn
	, b.satellite_tv_yn
	, b.iptv_vod_yn
	, b.internet_down_yn
	, b.internet_stream_yn
	, b.hotel_yn
	, b.ship_yn
	, b.flight_yn
	, b.mobile_yn
	, b.dvd_yn
	, b.blu_ray_yn
	, b.remark
	, b.confirm_items
	, (select 
		count(*) from movie a left 
	   join movie_publiction_info b
	   on a.movie_no = b.movie_no 
		and b.use_yn = 'Y' 
		and b.del_yn = 'N' 
	   where 1=1 and a.del_yn='N' {IN_STR}) as total_count
from movie a left 
join movie_publiction_info b
on a.movie_no = b.movie_no 
	and b.use_yn = 'Y' 
	and b.del_yn = 'N' 
where 1=1 
	and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select
	  movie_no
	, cp_corp_no
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
from movie
where 1=1 
	and del_yn = 'N' 
	and use_yn = 'Y'
order by movie_name asc 
;
-- [GetDetail]
select
	  movie_publiction_info_no
	, movie_no
	, (case when theater_yn = 'Y' then 'true' else 'false' end) as theater_yn
	, (case when cabletv_yn = 'Y' then 'true' else 'false' end) as cabletv_yn
	, (case when ground_wave_yn = 'Y' then 'true' else 'false' end) as ground_wave_yn
	, (case when satellite_tv_yn = 'Y' then 'true' else 'false' end) as satellite_tv_yn
	, (case when iptv_vod_yn = 'Y' then 'true' else 'false' end) as iptv_vod_yn
	, (case when internet_down_yn = 'Y' then 'true' else 'false' end) as internet_down_yn
	, (case when internet_stream_yn = 'Y' then 'true' else 'false' end) as internet_stream_yn
	, (case when hotel_yn = 'Y' then 'true' else 'false' end) as hotel_yn
	, (case when ship_yn = 'Y' then 'true' else 'false' end) as ship_yn
	, (case when flight_yn = 'Y' then 'true' else 'false' end) as flight_yn
	, (case when mobile_yn = 'Y' then 'true' else 'false' end) as mobile_yn
	, (case when dvd_yn = 'Y' then 'true' else 'false' end) as dvd_yn
	, (case when blu_ray_yn = 'Y' then 'true' else 'false' end) as blu_ray_yn
	, remark
	, confirm_items
	, use_yn
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
from movie_publiction_info
where use_yn = 'Y'
	and del_yn = 'N'
	and movie_no = :movie_no
order by movie_publiction_info_no desc
limit 1;

-- [Insert]
insert into movie_publiction_info(
	  movie_publiction_info_no
	, movie_no
	, theater_yn
	, cabletv_yn
	, ground_wave_yn
	, satellite_tv_yn
	, iptv_vod_yn
	, internet_down_yn
	, internet_stream_yn
	, hotel_yn
	, ship_yn
	, flight_yn
	, mobile_yn
	, dvd_yn
	, blu_ray_yn
	, remark
	, confirm_items
	, insert_date
	, insert_user_no
	, update_date
	, update_user_no
)
values(
	  :movie_publiction_info_no
	, :movie_no
	, :theater_yn
	, :cabletv_yn
	, :ground_wave_yn
	, :satellite_tv_yn
	, :iptv_vod_yn
	, :internet_down_yn
	, :internet_stream_yn
	, :hotel_yn
	, :ship_yn
	, :flight_yn
	, :mobile_yn
	, :dvd_yn
	, :blu_ray_yn
	, :remark
	, :confirm_items
	, current_timestamp
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
);

-- [Update]
update movie_publiction_info set
	  movie_no				= :movie_no                
	, theater_yn			= :theater_yn              
	, cabletv_yn			= :cabletv_yn              
	, ground_wave_yn		= :ground_wave_yn          
	, satellite_tv_yn		= :satellite_tv_yn         
	, iptv_vod_yn			= :iptv_vod_yn             
	, internet_down_yn		= :internet_down_yn        
	, internet_stream_yn	= :internet_stream_yn      
	, hotel_yn				= :hotel_yn                
	, ship_yn				= :ship_yn                 
	, flight_yn				= :flight_yn               
	, mobile_yn				= :mobile_yn               
	, dvd_yn				= :dvd_yn                  
	, blu_ray_yn			= :blu_ray_yn              
	, remark				= :remark                  
	, confirm_items			= :confirm_items          
	, update_date			= current_timestamp         
	, update_user_no		= :oper_user_no    
where movie_publiction_info_no = :movie_publiction_info_no
;

-- [Delete]
update movie_publiction_info set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where movie_publiction_info_no = :movie_publiction_info_no
;