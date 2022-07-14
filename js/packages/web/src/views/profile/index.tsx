import { useWallet } from '@j0nnyboi/wallet-adapter-react';
import { Col, Divider, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtCard } from '../../components/ArtCard';
import { CardLoader } from '../../components/MyLoader';
import { useCreator, useCreatorArts } from '../../hooks';
import { Button, Input, Layout, Modal, Form, Spin } from 'antd';

export const ProfileView = () => {
  const { id } = useParams<{ id: string }>();

  const artwork = useCreatorArts(id);
  const wallet = useWallet();
  const creator = useCreator(wallet.publicKey?.toBase58());
  const walletPubkey = wallet.publicKey?.toBase58() || '';

  // every 4 below states are human edition, if 
  //  there are empty use creator? instead, if creator?[x] empty
  const [userName, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');

  const [changes, setChanges] = useState(false)
  const [blocked, setBlocked] = useState(false)
  // hook to fill initial values fetched 

  const processUsername = () => {
    var finalUsername = '';
    if (userName === '') { // means user didn't edited, keep old if exist or put ''
      finalUsername = creator?.info.name || '';
    } else { finalUsername = userName; } // replace or initialize username
    return finalUsername;
  }
  const processAvatar = () => {
    var finalAvatar = '';
    if (avatar === '') {
      finalAvatar = creator?.info.image || '';
    } else { finalAvatar = avatar; } 
    return finalAvatar;
  }
  const processDesc = () => {
    var finalDesc = '';
    if (description === '') {
      finalDesc = creator?.info.description || '';
    } else { finalDesc = description; } 
    return finalDesc;
  }
  const processBack = () => {
    var finalBack = '';
    if (background === '') {
      finalBack = creator?.info.background || '';
    } else { finalBack = background; } 
    return finalBack;
  }

  const isValidUrl = urlString => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + //  protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + //  domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    if (!!urlPattern.test(urlString) === true || urlString.isEmpty) {
      setBlocked(false);
    }
    if (urlString.isEmpty) {

      setBlocked(false);
    }
    console.log("url test", urlString, blocked)
    return !!urlPattern.test(urlString);
  }

  function submitChanges() {
    // post
    // will include publickey & username
    const data = {
      address: walletPubkey,
      name: processUsername(),
      image: processAvatar(),
      description: processDesc(),
      background: processBack()
    };

    console.log("submitChanges DATA : ", data)

    fetch('http://127.0.0.1:5000/update', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => console.log(res));
  }

  const artworkGrid = (
    <div className="artwork-grid">
      {artwork.length > 0
        ? artwork.map((m, idx) => {
          const id = m.pubkey;
          return (
            <Link to={`/art/${id}`} key={idx}>
              <ArtCard
                key={id}
                pubkey={m.pubkey}
                preview={false}
                artView={true}
              />
            </Link>
          );
        })
        : [...Array(6)].map((_, idx) => <CardLoader key={idx} />)}
    </div>
  );

  return (
    <>
      {wallet.connected ?
        <>
          <Col>
            <Row
              style={{ margin: '0 30px', textAlign: 'left', fontSize: '1.4rem' }}
            >
              <Col span={24}>
                <div style={{ backgroundImage: `url(${creator?.info.background})`, height: 150, width: 'auto', borderRadius: 20, backgroundPosition: 'center' }}>
                  <div style={{ backgroundColor: '#00000059', height: '100%', width: '100%', display: 'flex', borderRadius: 20 }}>
                    <div style={{
                      alignSelf: 'center',
                      margin: 'auto',
                      display: 'flex'
                    }}>
                      <img style={{ height: 90, width: 'auto', border: '8px solid #ffffff33', borderRadius: 50 }} src={creator?.info.image}></img>
                      <div style={{ alignSelf: 'center', marginLeft: '25px', color: 'white' }}>{creator?.info.name || creator?.info.address}</div>
                    </div>
                  </div>
                </div>
                <Row>
                  <Col span={6}>
                    <div style={{ display: 'flex', flexFlow: 'column', marginTop: 20, marginLeft: 20 }}>
                      <Button size="small"
                        style={{ textAlign: 'left', border: 0 }}
                        type="text">
                        Profile
                      </Button>
                      <Button size="small"
                        style={{ textAlign: 'left', border: 0 }}
                        type="text">
                        My nft's
                      </Button>
                    </div>
                  </Col>
                  <Col span={18} style={{ marginTop: 30, paddingRight: 50 }}>
                    <h2 style={{ marginTop: 20 }}>
                      Edit profile
                      {/*walletPubkey*/}
                      {/* <MetaAvatar creators={creator ? [creator] : []} size={100} /> */}
                      {/*creator?.info.name || creator?.info.address*/}
                    </h2>
                    <div className="info-header">Username</div>
                    <Input
                      //value={creator?.info.name || creator?.info.address}
                      placeholder={creator?.info.name || creator?.info.address}
                      onChange={val => { setUsername(val.target.value); setChanges(true); }}
                    />
                    <div className="info-header">ABOUT THE CREATOR</div>
                    <Input
                      //value={creator?.info.name || creator?.info.address}
                      placeholder={creator?.info.description}
                      onChange={val => { setDescription(val.target.value); setChanges(true); }}
                    />
                    <div className="info-header">Avatar URL</div>
                    <Input
                      //value={creator?.info.name || creator?.info.address}
                      placeholder={creator?.info.image}
                      onChange={val => {
                        isValidUrl(val.target.value) ? // fully valid
                          setAvatar(val.target.value)
                          :
                          val.target.value === '' ? setBlocked(false) : setBlocked(true) // if value empty (backspace = unblock)
                      }}
                    />
                    <div className="info-header">Cover URL</div>
                    <Input
                      //value={creator?.info.name || creator?.info.address}
                      placeholder={creator?.info.background}
                      onChange={val => {
                        isValidUrl(val.target.value) ? // fully valid
                          setBackground(val.target.value)
                          :
                          val.target.value === '' ? setBlocked(false) : setBlocked(true) // if value empty (backspace = unblock)
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 25 }}>
                      {changes && !blocked ? (
                        <Button
                          className="ant-btn ant-btn-primary ant-btn-lg action-btn"
                          size="large"
                          style={{ width: 250 }}
                          onClick={() => submitChanges()}
                        >Apply changes</Button>
                      ) :
                        (
                          <Button
                            className="ant-btn ant-btn-primary ant-btn-lg action-btn"
                            size="large"
                            style={{ width: 250 }}
                            //onClick={() => submitChanges()}
                            disabled={true}
                          >{blocked ? 'Invalid URL' : 'No changes'}</Button>
                        )

                      }

                    </div>
                    {/*<div className="info-header">Art Created</div>*/}
                    {/*artworkGrid*/}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </>
        :
        <><div>not connected</div></>
      }
    </>
  );
};
