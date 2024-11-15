import { useLocation } from 'react-router-dom';
import { StyledTable, StyledTd, StyledTh } from '../../../common/styled/StyledTable';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { NoticeModal } from '../NoticeModal/NoticeModal';
import { Portal } from '../../../common/potal/Portal';
import { useRecoilState } from 'recoil';
import { modalState } from '../../../../stores/modalStatus';
import { INotice, INoticeListResponse } from '../../../../models/INotice';
import { postNoticeApi } from '../../../../api/postNoticeApi';
import { Notice } from '../../../../api/api';
import { PageNavigate } from '../../../common/pageNavigation/PageNavigate';

export const NoticeMain = () => {
    const { search } = useLocation();
    const [noticeList, setNoticeList] = useState<INotice[]>();
    const [listCount, setListCount] = useState<number>(0);
    const [modal, setModal] = useRecoilState<boolean>(modalState); // recoil에 저장된 state
    //const [modal2, setModal2] = useState<boolean>(false); // 컴포넌트에서 만든 state
    const [index, setIndex] = useState<number>();
    const [cPage, setCpage] = useState<number>();
    
    useEffect(() => {
        searchNoticeList();
    }, [search]);
    
    const searchNoticeList = async (currentPage?: number) => {
        const searchParam = new URLSearchParams(search);
        currentPage = currentPage || 1;
        searchParam.append('currentPage', currentPage.toString());
        searchParam.append('pageSize', '5');

        const searchList = await postNoticeApi<INoticeListResponse>(Notice.getList, searchParam);
        if (searchList) {
            setNoticeList(searchList.notice);
            setListCount(searchList.noticeCnt);
            setCpage(currentPage);
        }

        // axios.post("/board/noticeListJson.do", searchParam)
        //     .then((res) => {
        //         setNoticeList(res.data.notice);
        //         setListCount(res.data.noticeCnt);
        // });
    };

    const handlerModal = (index: number) => {
        setModal(!modal);
        setIndex(index);
    };

    const onPostSuccess = () => {
        setModal(!modal);
        searchNoticeList();
    };

    return (
        <>
            총 갯수 : {listCount} 현재 페이지 : {cPage}
            <StyledTable>
                <thead>
                    <tr>
                        <StyledTh size={5}>번호</StyledTh>
                        <StyledTh size={50}>제목</StyledTh>
                        <StyledTh size={10}>작성자</StyledTh>
                        <StyledTh size={20}>등록일</StyledTh>
                    </tr>
                </thead>
                <tbody>
                    {noticeList?.length > 0 ? (
                        noticeList?.map((notice) => {
                            return (
                                <tr key={notice.noticeIdx} onClick={() => handlerModal(notice.noticeIdx)}>
                                    <StyledTd>{notice.noticeIdx}</StyledTd>
                                    <StyledTd>{notice.title}</StyledTd>
                                    <StyledTd>{notice.author}</StyledTd>
                                    <StyledTd>{notice.createdDate}</StyledTd>
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <StyledTd colSpan={4}>데이터가 없습니다.</StyledTd>
                        </tr>
                    )}       
                </tbody>
            </StyledTable>
            <PageNavigate totalItemsCount={listCount} onChange={searchNoticeList} activePage={cPage} itemsCountPerPage={5}></PageNavigate>
            {modal && (
                <Portal>
                    <NoticeModal onSuccess={onPostSuccess} noticeSeq={index} setNoticeSeq={setIndex}/>
                </Portal>
            )}
        </>
    );
};
