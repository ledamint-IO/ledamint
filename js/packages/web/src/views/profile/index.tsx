import { useWallet } from '@j0nnyboi/wallet-adapter-react';
import { Col, Divider, Row } from 'antd';
import React, { useState } from 'react';
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

  const [userName, setUsername] = useState('null');
  const [avatar, setAvatar] = useState('null');
  const [description, setDescription] = useState('null');
  const [background, setBackground] = useState('null');

  console.log("creator ", creator)
  console.log("id ", id)
  function submitUsername() {
    // post
    // will include publickey & username
    const data = {
      address: walletPubkey,
      name: userName,
      image: avatar,
      description: description,
      background: background

    };
    console.log('submit');
    console.log(userName);
    console.log("DATA : ", data)
    fetch('http://127.0.0.1:5000/', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => console.log(res));


    console.log("new username ", userName)
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
      <Col>
        <Divider />
        <Row
          style={{ margin: '0 30px', textAlign: 'left', fontSize: '1.4rem' }}
        >
          <Col span={24}>
            <h2>
              {walletPubkey}
              {/* <MetaAvatar creators={creator ? [creator] : []} size={100} /> */}
              {creator?.info.name || creator?.info.address}
            </h2>
            <br />
            <div className="info-header">ABOUT THE CREATOR</div>
            <div className="info-content">{creator?.info.description}</div>
            <br />
            <div className="info-header">Edit creator info</div>
            <div>username: </div>
            <br />
            <Input
              //value={creator?.info.name || creator?.info.address}
              placeholder={creator?.info.name || creator?.info.address}
              onChange={val => setUsername(val.target.value)}
            />
            <Button
              // className="type-btn"
              size="large"

              onClick={() => submitUsername()}
            >Save</Button>
            {/*<div className="info-header">Art Created</div>*/}
            {/*artworkGrid*/}
          </Col>
        </Row>
      </Col>
    </>
  );
};
